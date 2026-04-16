import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';
import { scrapeWithApiInterception, scrapePage } from './browser-pool';
import type { Page } from 'playwright';

/**
 * Zepto Connector — Playwright Stealth + API Interception
 *
 * Strategy:
 * 1. Navigate to zepto.com/search?query={q} with stealth browser
 * 2. Intercept Zepto's internal search API JSON response
 * 3. Parse structured product data
 * 4. Fallback: DOM innerText parsing
 *
 * Key insight from Apify actor: uses /search?query= (not ?q=) for full results
 */
@Injectable()
export class ZeptoConnector implements Connector {
  readonly platformName = 'zepto';
  private readonly logger = new Logger(ZeptoConnector.name);

  async search(query: string, lat: number, lng: number): Promise<Product[]> {
    this.logger.debug(`[zepto] Scraping: "${query}" at (${lat}, ${lng})`);

    const url = `https://www.zepto.com/search?query=${encodeURIComponent(query)}`;

    const products = await scrapeWithApiInterception<Product[]>(
      url,
      // Zepto internal API patterns
      /api.*search|search.*product|catalog.*search|v2.*search/i,
      // API transformer
      (apiData: any) => this.transformApiData(apiData),
      // DOM fallback
      (page: Page) => this.domFallback(page),
      10000,
      lat,
      lng,
    );

    const result = products || [];
    this.logger.log(`[zepto] Found ${result.length} products for "${query}"`);
    return result;
  }

  /**
   * Transform Zepto API response to unified Product format
   */
  private transformApiData(apiData: any): Product[] {
    const items: Product[] = [];

    try {
      const products =
        apiData?.products ||
        apiData?.data?.products ||
        apiData?.data?.items ||
        apiData?.storeProducts ||
        apiData?.searchResults ||
        this.findProductArray(apiData);

      if (Array.isArray(products)) {
        for (const p of products) {
          const product = this.mapProduct(p);
          if (product) items.push(product);
        }
      }
    } catch (err) {
      this.logger.warn(`[zepto] API data parse error: ${(err as Error).message}`);
    }

    return items.slice(0, 25);
  }

  private findProductArray(data: any, depth = 0): any[] {
    if (depth > 5 || !data) return [];
    if (Array.isArray(data) && data.length > 0 && (data[0]?.name || data[0]?.product_name)) return data;
    if (typeof data === 'object') {
      for (const key of Object.keys(data)) {
        const result = this.findProductArray(data[key], depth + 1);
        if (result.length > 0) return result;
      }
    }
    return [];
  }

  private mapProduct(p: any): Product | null {
    const name = p.name || p.product_name || p.display_name || p.title;
    if (!name) return null;

    const price = p.offer_price || p.selling_price || p.price || p.mrp || 0;
    const priceNum = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^\d.]/g, '')) || 0;
    if (priceNum <= 0 || priceNum >= 10000) return null;

    const imageUrl =
      p.image || p.image_url || p.images?.[0] || p.product_image || p.thumbnail || '';
    const quantity = p.unit || p.weight || p.quantity || p.pack_size || '';

    // ETA: Zepto is known for 8-10 min delivery
    const eta = p.delivery_time || p.eta || 8;

    return {
      name,
      normalized_name: name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
      price: priceNum,
      currency: 'INR',
      quantity,
      platform: 'zepto',
      eta_minutes: eta,
      in_stock: p.in_stock !== false && p.available !== false && p.out_of_stock !== true,
      image_url: imageUrl || undefined,
      product_url: p.product_url || p.slug ? `https://www.zepto.com${p.slug || ''}` : undefined,
    };
  }

  /**
   * DOM fallback — enhanced innerText parsing with price validation
   */
  private async domFallback(page: Page): Promise<Product[]> {
    this.logger.debug('[zepto] Using DOM fallback');

    // Scroll to trigger lazy loading
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.scrollBy(0, 1200));
    await page.waitForTimeout(2000);

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
          !src.includes('google') &&
          !src.includes('facebook') &&
          (src.includes('cdn') || src.includes('zepto') || src.includes('cloudfront') || src.includes('/product') || /\.(jpg|jpeg|png|webp)/i.test(src))
        );
      });

      const bodyText = document.body?.innerText || '';
      const lines = bodyText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);

      let imageIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i] === 'ADD' && i + 2 < lines.length) {
          let priceIdx = i + 1;
          let price = 0;
          let name = '';
          let quantity = '';

          // Parse price — MUST start with ₹ and be a reasonable grocery price
          const priceText = lines[priceIdx];
          if (priceText && priceText.startsWith('₹')) {
            const parsed = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
            if (parsed > 0 && parsed < 10000) {
              price = parsed;
            }
          }

          // Skip discount lines
          let nameIdx = priceIdx + 1;
          while (nameIdx < lines.length && (
            lines[nameIdx] === 'OFF' ||
            lines[nameIdx].startsWith('₹') ||
            /^\d+%/.test(lines[nameIdx])
          )) {
            nameIdx++;
          }

          // Product name
          if (nameIdx < lines.length) {
            name = lines[nameIdx];
          }

          // Quantity
          if (nameIdx + 1 < lines.length) {
            const qLine = lines[nameIdx + 1];
            if (/\d+\s*(pack|g|kg|ml|l|pcs|pouch|piece)/i.test(qLine)) {
              quantity = qLine;
            }
          }

          if (name && name.length > 3 && !name.startsWith('₹') && name !== 'ADD' && !seen.has(name)) {
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
              platform: 'zepto',
              eta_minutes: 8,
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
