import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';
import { scrapeWithApiInterception, scrapePage } from './browser-pool';
import type { Page } from 'playwright';

/**
 * Swiggy Instamart Connector — Playwright Stealth + API Interception
 *
 * Strategy:
 * 1. Navigate to Instamart search page with stealth browser
 * 2. Intercept Swiggy's internal API responses (search/listing endpoints)
 * 3. Parse structured JSON for product data
 * 4. Fallback: DOM-based innerText parsing if API interception fails
 */
@Injectable()
export class InstamartConnector implements Connector {
  readonly platformName = 'instamart';
  private readonly logger = new Logger(InstamartConnector.name);

  async search(query: string, lat: number, lng: number): Promise<Product[]> {
    this.logger.debug(`[instamart] Scraping: "${query}" at (${lat}, ${lng})`);

    const url = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`;

    const products = await scrapeWithApiInterception<Product[]>(
      url,
      // Swiggy internal API patterns for Instamart search
      /instamart.*search|v1.*search.*product|listing.*widgets/i,
      // API transformer — extract products from Swiggy's JSON response
      (apiData: any) => this.transformApiData(apiData, query),
      // DOM fallback
      (page: Page) => this.domFallback(page, query),
      10000,
      lat,
      lng,
    );

    const result = products || [];
    this.logger.log(`[instamart] Found ${result.length} products for "${query}"`);
    return result;
  }

  /**
   * Transform Swiggy Instamart API response to unified Product format.
   * Swiggy's API structure varies, so we try multiple known paths.
   */
  private transformApiData(apiData: any, _query: string): Product[] {
    const items: Product[] = [];

    try {
      // Try to find product arrays in common Swiggy response structures
      const widgets = this.extractWidgets(apiData);

      for (const widget of widgets) {
        const products = this.extractProductsFromWidget(widget);
        items.push(...products);
      }

      // Direct product array
      if (items.length === 0) {
        const products = this.findProductArray(apiData);
        items.push(...products);
      }
    } catch (err) {
      this.logger.warn(`[instamart] API data parse error: ${(err as Error).message}`);
    }

    return items.slice(0, 20);
  }

  private extractWidgets(data: any): any[] {
    if (!data) return [];
    // Swiggy nests data under data.widgets or data.data.widgets
    if (data.widgets) return data.widgets;
    if (data.data?.widgets) return data.data.widgets;
    if (data.data?.cards) return data.data.cards;
    if (data.statusMessage === 'success' && data.data) {
      return Array.isArray(data.data) ? data.data : [data.data];
    }
    return [data];
  }

  private extractProductsFromWidget(widget: any): Product[] {
    const items: Product[] = [];
    const products = widget.products || widget.data?.products || widget.cardData?.products || [];

    for (const p of products) {
      const product = this.mapProduct(p);
      if (product) items.push(product);
    }
    return items;
  }

  private findProductArray(data: any, depth = 0): Product[] {
    if (depth > 5 || !data) return [];
    if (Array.isArray(data)) {
      const items: Product[] = [];
      for (const item of data) {
        const p = this.mapProduct(item);
        if (p) items.push(p);
      }
      if (items.length > 0) return items;
    }
    if (typeof data === 'object') {
      for (const key of Object.keys(data)) {
        const result = this.findProductArray(data[key], depth + 1);
        if (result.length > 0) return result;
      }
    }
    return [];
  }

  private mapProduct(p: any): Product | null {
    const name = p.display_name || p.name || p.productName || p.product_name;
    if (!name) return null;

    const price = p.offer_price || p.price || p.mrp || p.selling_price || 0;
    const imageUrl = p.image || p.images?.[0] || p.product_image || p.imageUrl || '';
    const inStock = p.in_stock !== false && p.available !== false && p.inventory !== 0;

    return {
      platform: 'instamart',
      productId: p.id || p.product_id || Math.random().toString(36).substring(7),
      name,
      normalized_name: name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
      imageUrl,
      productUrl: p.product_url || undefined,
      price: {
        current: typeof price === 'number' ? price : parseFloat(String(price).replace(/[^\d.]/g, '')) || 0,
        original: p.mrp || undefined,
      },
      inventory: {
        inStock,
        quantity: p.inventory_count || undefined,
      },
      delivery: {
        eta: 15,
        etaText: '15 mins',
      },
      metadata: {
        weight: p.quantity || p.weight || p.pack_desc || '',
      },
      scrapedAt: new Date(),
    };
  }

  /**
   * DOM fallback — card-based extraction when API interception fails
   */
  private async domFallback(page: Page, _query: string): Promise<Product[]> {
    this.logger.debug('[instamart] Using DOM fallback');

    // Scroll to trigger lazy loading
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(2000);

    return page.evaluate(() => {
      const items: any[] = [];
      const seen = new Set<string>();

      // Strategy 1: Find product cards by looking for clickable containers with price + name + image
      const allLinks = Array.from(document.querySelectorAll('a[href]'));
      const productLinks = allLinks.filter((a) => {
        const href = a.getAttribute('href') || '';
        return (
          href.includes('/product') ||
          href.includes('/item') ||
          href.includes('/instamart')
        );
      });

      for (const link of productLinks) {
        const container = (link.closest('div') || link) as HTMLElement;
        const text = container.innerText || '';
        
        // Must contain a price
        const priceMatch = text.match(/₹\s*(\d+(?:\.\d+)?)/);
        if (!priceMatch) continue;
        const price = parseFloat(priceMatch[1]);
        if (price <= 0 || price >= 10000) continue;

        // Find the image within this container
        let imageUrl = '';
        const imgs = container.querySelectorAll('img');
        for (const img of imgs) {
          const src = (img as HTMLImageElement).src || img.getAttribute('data-src') || '';
          if (
            src.startsWith('http') &&
            !src.includes('data:image') &&
            !src.endsWith('.svg') &&
            !src.includes('/logo') &&
            !src.includes('/icon') &&
            !src.includes('/banner') &&
            (src.includes('swiggy') || src.includes('cloudinary') || /\.(jpg|jpeg|png|webp)/i.test(src))
          ) {
            imageUrl = src;
            break;
          }
        }

        // Find the name — longest text that's not a price/discount
        const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) =>
          l.length > 3 &&
          !l.startsWith('₹') &&
          !/^\d+%/.test(l) &&
          l !== 'ADD' &&
          l !== 'Add' &&
          !/^\d+\s*min/i.test(l)
        );

        const name = lines.sort((a: string, b: string) => b.length - a.length)[0];
        if (!name || seen.has(name)) continue;
        seen.add(name);

        items.push({
          platform: 'instamart',
          productId: Math.random().toString(36).substring(7),
          name,
          normalized_name: name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
          imageUrl: imageUrl || '',
          price: {
            current: price,
          },
          inventory: {
            inStock: true,
          },
          delivery: {
            eta: 15,
            etaText: '15 mins',
          },
          metadata: {},
          scrapedAt: new Date(),
        });
      }

      // Strategy 2: Fallback to innerText parsing if strategy 1 found nothing
      if (items.length === 0) {
        const allImages = Array.from(document.querySelectorAll('img'));
        const productImages = allImages.filter((img) => {
          const src = img.src || img.getAttribute('data-src') || '';
          return (
            src.startsWith('http') &&
            !src.includes('data:image') &&
            !src.endsWith('.svg') &&
            !src.includes('/logo') &&
            !src.includes('/icon') &&
            (src.includes('swiggy') || src.includes('cloudinary') || /\.(jpg|jpeg|png|webp)/i.test(src))
          );
        });

        const bodyText = document.body?.innerText || '';
        const bodyLines = bodyText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
        let imgIdx = 0;

        for (let i = 0; i < bodyLines.length; i++) {
          if (bodyLines[i].startsWith('₹')) {
            const p = parseFloat(bodyLines[i].replace(/[^\d.]/g, '')) || 0;
            if (p <= 0 || p >= 10000) continue;

            let nm = '';
            for (let j = i + 1; j < Math.min(i + 4, bodyLines.length); j++) {
              if (bodyLines[j].length > 3 && !bodyLines[j].startsWith('₹') && !/^\d+%/.test(bodyLines[j])) {
                nm = bodyLines[j];
                break;
              }
            }

            if (nm && !seen.has(nm)) {
              seen.add(nm);
              const img = productImages[imgIdx] || null;
              imgIdx++;
              items.push({
                platform: 'instamart',
                productId: Math.random().toString(36).substring(7),
                name: nm,
                normalized_name: nm.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
                imageUrl: img?.src || '',
                price: {
                  current: p,
                },
                inventory: {
                  inStock: true,
                },
                delivery: {
                  eta: 15,
                  etaText: '15 mins',
                },
                metadata: {},
                scrapedAt: new Date(),
              });
            }
          }
        }
      }

      return items.slice(0, 20);
    });
  }
}

