import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';
import { scrapePage } from './browser-pool';

/**
 * Blinkit Connector — Headless Chrome
 * Verified: In headless mode, products render as flat text.
 * Pattern: {discount}% OFF\n{ETA} MINS\n{name}\n{qty}\n₹{price}\nADD
 */
@Injectable()
export class BlinkitConnector implements Connector {
  readonly platformName = 'blinkit';
  private readonly logger = new Logger(BlinkitConnector.name);

  async search(query: string, _lat: number, _lng: number): Promise<Product[]> {
    this.logger.debug(`[blinkit] Scraping: "${query}"`);

    const url = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;

    const products = await scrapePage<Product[]>(
      url,
      async (page) => {
        // Dismiss location modal
        try { await page.keyboard.press('Escape'); } catch { /* ok */ }
        await new Promise((r) => setTimeout(r, 3000));

        return page.evaluate((q: string) => {
          const items: any[] = [];
          const bodyText = document.body?.innerText || '';
          const lines = bodyText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);

          // Find the "Showing results" marker to know where products start
          let startIdx = 0;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('Showing results')) {
              startIdx = i + 1;
              break;
            }
          }

          // Parse pattern: {optional discount}% OFF → {ETA} MINS → {name} → {qty} → ₹{price} → ADD
          for (let i = startIdx; i < lines.length; i++) {
            // Look for "ADD" buttons as product delimiters
            if (lines[i] === 'ADD') {
              // Walk backwards to find the product info
              let name = '';
              let price = 0;
              let quantity = '';
              let eta = 16;

              // Scan backwards from ADD
              for (let j = i - 1; j >= Math.max(startIdx, i - 6); j--) {
                const line = lines[j];

                // Price line: ₹XX
                if (line.startsWith('₹') && price === 0) {
                  price = parseFloat(line.replace(/[^\d.]/g, '')) || 0;
                }
                // Quantity line: patterns like "500 ml", "1 ltr", "1 kg"
                else if (/^\d+\s*(ml|g|kg|ltr|l|pack|pcs|pouch)/i.test(line) && !quantity) {
                  quantity = line;
                }
                // ETA line: "16 MINS"
                else if (/^\d+\s*MINS?$/i.test(line)) {
                  eta = parseInt(line) || 16;
                }
                // Discount: "13% OFF"
                else if (/^\d+%\s*OFF$/i.test(line)) {
                  // skip
                }
                // Name: anything else that's long enough
                else if (line.length > 3 && !line.startsWith('₹') && !name) {
                  name = line;
                }
              }

              if (name && name.length > 3) {
                items.push({
                  name,
                  normalized_name: q.toLowerCase(),
                  price,
                  currency: 'INR',
                  quantity,
                  platform: 'blinkit',
                  eta_minutes: eta,
                  in_stock: true,
                });
              }
            }
          }

          return items.slice(0, 15);
        }, query);
      },
      5000,
    );

    const result = products || [];
    this.logger.log(`[blinkit] Scraped ${result.length} products for "${query}"`);
    return result;
  }
}
