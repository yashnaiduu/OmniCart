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
      name,
      normalized_name: name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
      price: typeof price === 'number' ? price : parseFloat(String(price).replace(/[^\d.]/g, '')) || 0,
      currency: 'INR',
      quantity: p.quantity || p.weight || p.pack_desc || '',
      platform: 'instamart',
      eta_minutes: 15,
      in_stock: inStock,
      image_url: imageUrl,
      product_url: p.product_url || undefined,
    };
  }

  /**
   * DOM fallback — parse innerText when API interception fails
   */
  private async domFallback(page: Page, _query: string): Promise<Product[]> {
    this.logger.debug('[instamart] Using DOM fallback');

    return page.evaluate(() => {
      const items: any[] = [];
      const seen = new Set<string>();

      // Collect product images
      const allImages = Array.from(document.querySelectorAll('img'));
      const productImages = allImages.filter((img) => {
        const src = img.src || img.getAttribute('data-src') || '';
        return (
          src.startsWith('http') &&
          !src.includes('data:image') &&
          !src.endsWith('.svg') &&
          !src.includes('/logo') &&
          !src.includes('/icon') &&
          !src.includes('/banner') &&
          (src.includes('swiggy') || src.includes('res.cloudinary') || /\.(jpg|jpeg|png|webp)/i.test(src))
        );
      });

      const bodyText = document.body?.innerText || '';
      const lines = bodyText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);

      let imageIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Look for price patterns followed by product names
        if (line.startsWith('₹') && i + 1 < lines.length) {
          const price = parseFloat(line.replace(/[^\d.]/g, '')) || 0;
          if (price <= 0 || price >= 10000) continue;

          // Look for product name nearby
          let name = '';
          for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
            const candidate = lines[j];
            if (candidate.length > 3 && !candidate.startsWith('₹') && !/^\d+%/.test(candidate)) {
              name = candidate;
              break;
            }
          }

          if (name && !seen.has(name)) {
            seen.add(name);
            const img = productImages[imageIndex] || null;
            imageIndex++;

            items.push({
              name,
              normalized_name: name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
              price,
              currency: 'INR',
              quantity: '',
              platform: 'instamart',
              eta_minutes: 15,
              in_stock: true,
              image_url: img?.src || undefined,
            });
          }
        }
      }

      return items.slice(0, 15);
    });
  }
}
