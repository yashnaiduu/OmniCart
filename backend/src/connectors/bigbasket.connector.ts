import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';
import { scrapeWithApiInterception, scrapePage } from './browser-pool';
import type { Page } from 'playwright';

/**
 * BigBasket Connector — Playwright Stealth + API Interception
 *
 * Strategy:
 * 1. Navigate to BigBasket search page with stealth browser
 * 2. Intercept BigBasket's internal search/listing API JSON response
 * 3. Parse structured product data
 * 4. Fallback: DOM-based extraction using product card selectors
 *
 * Inspired by Gaurang105/BigBasket_Scraper approach but ported to
 * Playwright with API interception for better reliability.
 */
@Injectable()
export class BigBasketConnector implements Connector {
  readonly platformName = 'bigbasket';
  private readonly logger = new Logger(BigBasketConnector.name);

  async search(query: string, lat: number, lng: number): Promise<Product[]> {
    this.logger.debug(`[bigbasket] Scraping: "${query}" at (${lat}, ${lng})`);

    const url = `https://www.bigbasket.com/ps/?q=${encodeURIComponent(query)}&nc=as`;

    const products = await scrapeWithApiInterception<Product[]>(
      url,
      // BigBasket internal search API patterns
      /product\/search|listing\/product|ps\/\?|tab_info|search.*product/i,
      // API transformer
      (apiData: any) => this.transformApiData(apiData),
      // DOM fallback
      (page: Page) => this.domFallback(page),
      8000,
      lat,
      lng,
    );

    const result = products || [];
    this.logger.log(`[bigbasket] Found ${result.length} products for "${query}"`);
    return result;
  }

  /**
   * Transform BigBasket API response to unified Product format
   */
  private transformApiData(apiData: any): Product[] {
    const items: Product[] = [];

    try {
      const products =
        apiData?.products ||
        apiData?.data?.products ||
        apiData?.tab_info?.[0]?.product_info?.products ||
        apiData?.results ||
        this.findProductArray(apiData);

      if (Array.isArray(products)) {
        for (const p of products) {
          const product = this.mapProduct(p);
          if (product) items.push(product);
        }
      }
    } catch (err) {
      this.logger.warn(`[bigbasket] API data parse error: ${(err as Error).message}`);
    }

    return items.slice(0, 25);
  }

  private findProductArray(data: any, depth = 0): any[] {
    if (depth > 5 || !data) return [];
    if (Array.isArray(data) && data.length > 0 && (data[0]?.desc || data[0]?.name || data[0]?.product_name)) return data;
    if (typeof data === 'object') {
      for (const key of Object.keys(data)) {
        const result = this.findProductArray(data[key], depth + 1);
        if (result.length > 0) return result;
      }
    }
    return [];
  }

  private mapProduct(p: any): Product | null {
    const name = p.desc || p.name || p.product_name || p.display_name || p.title;
    if (!name) return null;

    const price =
      p.pricing?.discount?.prim_price?.sp ||
      p.sp || p.sale_price || p.offer_price || p.price ||
      p.pricing?.prim_price?.sp || p.mrp || 0;
    const priceNum = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^\d.]/g, '')) || 0;
    if (priceNum <= 0 || priceNum >= 10000) return null;

    const imageUrl =
      p.p_img_url || p.image || p.image_url || p.images?.[0] || p.product_image || '';
    const weight = p.w || p.weight || p.quantity || p.pack_desc || p.unit || '';
    const brand = p.brand?.name || p.brand || '';

    return {
      name: brand ? `${brand} ${name}` : name,
      normalized_name: name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
      price: priceNum,
      currency: 'INR',
      quantity: weight,
      platform: 'bigbasket',
      eta_minutes: 30,
      in_stock: p.in_stock !== false && p.available !== false,
      image_url: imageUrl || undefined,
      product_url: p.absolute_url ? `https://www.bigbasket.com${p.absolute_url}` : undefined,
    };
  }

  /**
   * DOM fallback — extract from BigBasket product cards using selectors
   */
  private async domFallback(page: Page): Promise<Product[]> {
    this.logger.debug('[bigbasket] Using DOM fallback');

    // Scroll to trigger lazy loading
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1500);

    return page.evaluate(() => {
      const items: any[] = [];
      const seen = new Set<string>();

      // BigBasket product links contain /pd/ in href
      const links = document.querySelectorAll('a[href*="/pd/"]');

      links.forEach((link) => {
        const card = link.closest('li') || link.closest('div[class]') || link;

        const nameEl = card.querySelector('h3') || link.querySelector('h3');
        const name = nameEl?.textContent?.trim();
        if (!name || seen.has(name)) return;
        seen.add(name);

        // Find product image
        let imageUrl = '';
        let imgEl = card.querySelector('img');
        if (!imgEl) {
          const parent = card.parentElement;
          if (parent) imgEl = parent.querySelector('img');
        }
        if (imgEl) {
          const src = imgEl.src || imgEl.getAttribute('data-src') || imgEl.getAttribute('srcset')?.split(' ')[0] || '';
          if (
            src.startsWith('http') &&
            !src.includes('data:image') &&
            !src.endsWith('.svg') &&
            !src.includes('/logo') &&
            !src.includes('/icon')
          ) {
            imageUrl = src;
          }
        }

        // Find price
        const allSpans = card.querySelectorAll('span');
        let price = 0;
        let weight = '';
        for (const span of allSpans) {
          const text = span.textContent?.trim() || '';
          if ((text.startsWith('₹') || /^\d+$/.test(text)) && price === 0) {
            const parsed = parseFloat(text.replace(/[^\d.]/g, ''));
            if (parsed > 0 && parsed < 10000) price = parsed;
          }
          if (/\d+\s*(g|kg|ml|l|pack|pcs|pouch)/i.test(text) && !weight) {
            weight = text;
          }
        }

        items.push({
          name,
          normalized_name: name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
          price,
          currency: 'INR',
          quantity: weight,
          platform: 'bigbasket',
          eta_minutes: 30,
          in_stock: true,
          image_url: imageUrl || undefined,
          product_url: 'https://www.bigbasket.com' + (link as HTMLAnchorElement).getAttribute('href'),
        });
      });

      return items.slice(0, 20);
    });
  }
}
