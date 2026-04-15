import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';
import { scrapePage } from './browser-pool';

/**
 * Zepto Connector — Headless Chrome
 * Uses innerText parsing + DOM image extraction.
 * Fixed: price validation to reject absurd values (>₹9999 for groceries).
 */
@Injectable()
export class ZeptoConnector implements Connector {
  readonly platformName = 'zepto';
  private readonly logger = new Logger(ZeptoConnector.name);

  async search(query: string, _lat: number, _lng: number): Promise<Product[]> {
    this.logger.debug(`[zepto] Scraping: "${query}"`);

    const url = `https://www.zepto.com/search?query=${encodeURIComponent(query)}`;

    const products = await scrapePage<Product[]>(
      url,
      async (page) => {
        // Zepto needs extra time for JS rendering + images
        await new Promise((r) => setTimeout(r, 7000));

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
              (src.includes('cdn') || src.includes('zepto') || src.includes('cloudfront') || src.includes('/product') || /\.(jpg|jpeg|png|webp)/i.test(src))
            );
          });

          // InnerText parsing
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
                // Sanity check: grocery items should not cost more than ₹9999
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

          return items.slice(0, 15);
        });
      },
      8000,
    );

    const result = products || [];
    this.logger.log(`[zepto] Scraped ${result.length} products for "${query}"`);
    return result;
  }
}
