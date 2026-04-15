import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';
import { scrapePage } from './browser-pool';

/**
 * Zepto Connector — Headless Chrome
 * Verified: In headless mode, products render as flat text without data-testid.
 * Uses innerText parsing to extract product names and prices.
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
        // Zepto needs time for JS to fully render
        await new Promise((r) => setTimeout(r, 6000));

        return page.evaluate((q: string) => {
          const items: any[] = [];
          const bodyText = document.body?.innerText || '';

          // Parse Zepto's flat text structure:
          // Pattern: ADD\n₹{price}\n{optional discount}\n{name}\n{quantity}\n{rating}
          const lines = bodyText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);

          for (let i = 0; i < lines.length; i++) {
            if (lines[i] === 'ADD' && i + 2 < lines.length) {
              // Next line should be price (₹XX)
              let priceIdx = i + 1;
              let price = 0;
              let name = '';
              let quantity = '';

              // Parse price
              const priceText = lines[priceIdx];
              if (priceText && priceText.startsWith('₹')) {
                price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
              }

              // Skip discount lines like "₹1\nOFF"
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

              // Quantity (next line after name, usually like "1 pack (500 ml)")
              if (nameIdx + 1 < lines.length) {
                const qLine = lines[nameIdx + 1];
                if (/\d+\s*(pack|g|kg|ml|l|pcs|pouch|piece)/i.test(qLine)) {
                  quantity = qLine;
                }
              }

              if (name && name.length > 3 && !name.startsWith('₹') && name !== 'ADD') {
                items.push({
                  name,
                  normalized_name: q.toLowerCase(),
                  price,
                  currency: 'INR',
                  quantity,
                  platform: 'zepto',
                  eta_minutes: 8,
                  in_stock: true,
                });
              }
            }
          }

          return items.slice(0, 15);
        }, query);
      },
      8000,
    );

    const result = products || [];
    this.logger.log(`[zepto] Scraped ${result.length} products for "${query}"`);
    return result;
  }
}
