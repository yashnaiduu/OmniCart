import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';
import { scrapeWithApiInterception, scrapePage } from './browser-pool';
import type { Page } from 'playwright';

/**
 * Blinkit Connector — Playwright Stealth + API Interception
 *
 * Strategy:
 * 1. Navigate to Blinkit search page with stealth browser
 * 2. Intercept Blinkit's internal product search API (e.g. /v6/search/products)
 * 3. Parse structured JSON for product data
 * 4. Fallback: DOM innerText parsing with infinite scroll support
 */
@Injectable()
export class BlinkitConnector implements Connector {
  readonly platformName = 'blinkit';
  private readonly logger = new Logger(BlinkitConnector.name);

  async search(query: string, lat: number, lng: number): Promise<Product[]> {
    this.logger.debug(`[blinkit] Scraping: "${query}" at (${lat}, ${lng})`);

    const url = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;

    const products = await scrapeWithApiInterception<Product[]>(
      url,
      // Blinkit internal search API patterns
      /search\/products|search.*product|layout.*listing/i,
      // API transformer
      (apiData: any) => this.transformApiData(apiData),
      // DOM fallback
      (page: Page) => this.domFallback(page),
      8000,
      lat,
      lng,
    );

    const result = products || [];
    this.logger.log(`[blinkit] Found ${result.length} products for "${query}"`);
    return result;
  }

  /**
   * Transform Blinkit API response to unified Product format
   */
  private transformApiData(apiData: any): Product[] {
    const items: Product[] = [];

    try {
      // Blinkit API may nest products under data.products, products, or data
      const products =
        apiData?.products ||
        apiData?.data?.products ||
        apiData?.data?.items ||
        apiData?.widgets?.[0]?.data ||
        this.findProductArray(apiData);

      if (Array.isArray(products)) {
        for (const p of products) {
          const product = this.mapProduct(p);
          if (product) items.push(product);
        }
      }
    } catch (err) {
      this.logger.warn(`[blinkit] API data parse error: ${(err as Error).message}`);
    }

    return items.slice(0, 25);
  }

  private findProductArray(data: any, depth = 0): any[] {
    if (depth > 5 || !data) return [];
    if (Array.isArray(data) && data.length > 0 && data[0]?.name) return data;
    if (typeof data === 'object') {
      for (const key of Object.keys(data)) {
        const result = this.findProductArray(data[key], depth + 1);
        if (result.length > 0) return result;
      }
    }
    return [];
  }

  private mapProduct(p: any): Product | null {
    const name = p.name || p.product_name || p.display_name;
    if (!name) return null;

    const price = p.price || p.offer_price || p.selling_price || p.mrp || 0;
    const priceNum = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^\d.]/g, '')) || 0;
    if (priceNum <= 0 || priceNum >= 10000) return null;

    const imageUrl = p.image_url || p.image || p.images?.[0] || p.product_image || '';
    const quantity = p.unit || p.weight || p.quantity || p.pack_desc || '';

    return {
      name,
      normalized_name: name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
      price: priceNum,
      currency: 'INR',
      quantity,
      platform: 'blinkit',
      eta_minutes: p.eta || p.delivery_time || 12,
      in_stock: p.in_stock !== false && p.available !== false,
      image_url: imageUrl || undefined,
      product_url: p.product_url || p.slug ? `https://blinkit.com${p.slug || ''}` : undefined,
    };
  }

  /**
   * DOM fallback — enhanced innerText parsing with image correlation
   */
  private async domFallback(page: Page): Promise<Product[]> {
    this.logger.debug('[blinkit] Using DOM fallback');

    // Dismiss location modal if present
    try { await page.keyboard.press('Escape'); } catch { /* ok */ }
    // Wait for products and scroll for lazy-loaded content
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(2000);

    return page.evaluate(() => {
      const items: any[] = [];
      const seen = new Set<string>();

      // Collect product images by URL pattern
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
          !src.includes('google') &&
          !src.includes('facebook') &&
          (src.includes('cdn') || src.includes('grofers') || src.includes('blinkit') || src.includes('cloudfront') || src.includes('/product') || /\.(jpg|jpeg|png|webp)/i.test(src))
        );
      });

      const bodyText = document.body?.innerText || '';
      const lines = bodyText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);

      let startIdx = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Showing results')) {
          startIdx = i + 1;
          break;
        }
      }

      let imageIndex = 0;
      for (let i = startIdx; i < lines.length; i++) {
        if (lines[i] === 'ADD') {
          let name = '';
          let price = 0;
          let quantity = '';
          let eta = 12;

          for (let j = i - 1; j >= Math.max(startIdx, i - 6); j--) {
            const line = lines[j];
            if (line.startsWith('₹') && price === 0) {
              price = parseFloat(line.replace(/[^\d.]/g, '')) || 0;
            } else if (/^\d+\s*(ml|g|kg|ltr|l|pack|pcs|pouch|piece)/i.test(line) && !quantity) {
              quantity = line;
            } else if (/^\d+\s*MINS?$/i.test(line)) {
              eta = parseInt(line) || 12;
            } else if (/^\d+%\s*OFF$/i.test(line)) {
              // skip discounts
            } else if (line.length > 3 && !line.startsWith('₹') && !name) {
              name = line;
            }
          }

          if (name && name.length > 3 && !seen.has(name)) {
            seen.add(name);
            const img = productImages[imageIndex] || null;
            const imgSrc = img ? (img.src || img.getAttribute('data-src') || '') : '';
            imageIndex++;

            items.push({
              name,
              normalized_name: name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
              price,
              currency: 'INR',
              quantity,
              platform: 'blinkit',
              eta_minutes: eta,
              in_stock: true,
              image_url: imgSrc || undefined,
            });
          }
        }
      }

      return items.slice(0, 20);
    });
  }
}
