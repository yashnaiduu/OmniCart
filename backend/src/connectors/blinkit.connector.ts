import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';
import { scrapePage } from './browser-pool';

/**
 * Blinkit Connector — Headless Chrome
 * Uses innerText parsing + DOM image extraction.
 * Images are matched by collecting all product-like <img> elements
 * and correlating them with parsed products by order.
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
        // Wait for product grid to render (including images)
        await new Promise((r) => setTimeout(r, 5000));

        return page.evaluate(() => {
          const items: any[] = [];
          const seen = new Set<string>();

          // Collect product images by URL pattern (NOT by dimensions — headless Chrome
          // reports width/height=0 for images that haven't been laid out yet)
          const allImages = Array.from(document.querySelectorAll('img'));
          const productImages = allImages.filter((img) => {
            const src = img.src || img.getAttribute('data-src') || '';
            // Blinkit product images come from CDN domains
            return (
              src.startsWith('http') &&
              !src.includes('data:image') &&
              !src.endsWith('.svg') &&
              !src.includes('/logo') &&
              !src.includes('/icon') &&
              !src.includes('/banner') &&
              !src.includes('google') &&
              !src.includes('facebook') &&
              !src.includes('analytics') &&
              (src.includes('cdn') || src.includes('grofers') || src.includes('blinkit') || src.includes('cloudfront') || src.includes('/product') || /\.(jpg|jpeg|png|webp)/i.test(src))
            );
          });

          // InnerText parsing — proven to work on Blinkit
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
              let eta = 16;

              for (let j = i - 1; j >= Math.max(startIdx, i - 6); j--) {
                const line = lines[j];
                if (line.startsWith('₹') && price === 0) {
                  price = parseFloat(line.replace(/[^\d.]/g, '')) || 0;
                } else if (/^\d+\s*(ml|g|kg|ltr|l|pack|pcs|pouch|piece)/i.test(line) && !quantity) {
                  quantity = line;
                } else if (/^\d+\s*MINS?$/i.test(line)) {
                  eta = parseInt(line) || 16;
                } else if (/^\d+%\s*OFF$/i.test(line)) {
                  // skip discounts
                } else if (line.length > 3 && !line.startsWith('₹') && !name) {
                  name = line;
                }
              }

              if (name && name.length > 3 && !seen.has(name)) {
                seen.add(name);
                // Match image by index — product images appear in same order as products
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

          return items.slice(0, 15);
        });
      },
      6000,
    );

    const result = products || [];
    this.logger.log(`[blinkit] Scraped ${result.length} products for "${query}"`);
    return result;
  }
}
