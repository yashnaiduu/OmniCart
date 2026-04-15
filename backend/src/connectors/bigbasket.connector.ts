import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';
import { scrapePage } from './browser-pool';

/**
 * BigBasket Connector — Headless Chrome (DOM-based)
 * Uses DOM selectors for product cards.
 * Image extraction: queries img inside card, falls back to data-src for lazy-loaded images.
 */
@Injectable()
export class BigBasketConnector implements Connector {
  readonly platformName = 'bigbasket';
  private readonly logger = new Logger(BigBasketConnector.name);

  async search(query: string, _lat: number, _lng: number): Promise<Product[]> {
    this.logger.debug(`[bigbasket] Scraping: "${query}"`);

    const url = `https://www.bigbasket.com/ps/?q=${encodeURIComponent(query)}&nc=as`;

    const products = await scrapePage<Product[]>(
      url,
      async (page) => {
        // Wait extra for lazy-loaded product grid + images
        await new Promise((r) => setTimeout(r, 4000));

        // Scroll down to trigger lazy-loaded images
        await page.evaluate(() => {
          window.scrollBy(0, 800);
        });
        await new Promise((r) => setTimeout(r, 1500));

        return page.evaluate((q: string) => {
          const items: any[] = [];
          const seen = new Set<string>();

          // BigBasket product links contain /pd/ in href
          const links = document.querySelectorAll('a[href*="/pd/"]');

          links.forEach((link) => {
            // Walk up to find the product card container
            const card = link.closest('li') || link.closest('div[class]') || link;

            const nameEl = card.querySelector('h3') || link.querySelector('h3');
            const name = nameEl?.textContent?.trim();
            if (!name || seen.has(name)) return;
            seen.add(name);

            // Find product image — check the card and ancestors for img tags
            let imageUrl = '';

            // Try inside card first
            let imgEl = card.querySelector('img');

            // If not found, try the parent container (BigBasket sometimes puts image in a sibling div)
            if (!imgEl) {
              const parent = card.parentElement;
              if (parent) {
                imgEl = parent.querySelector('img');
              }
            }

            if (imgEl) {
              // Check src first, then data-src for lazy loading
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

            // Find price — look for ₹ symbol
            const allSpans = card.querySelectorAll('span');
            let price = 0;
            let weight = '';
            for (const span of allSpans) {
              const text = span.textContent?.trim() || '';
              if ((text.startsWith('₹') || /^\d+$/.test(text)) && price === 0) {
                const parsed = parseFloat(text.replace(/[^\d.]/g, ''));
                if (parsed > 0 && parsed < 10000) price = parsed;
              }
              // Weight patterns
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

          return items.slice(0, 15);
        }, query);
      },
      6000,
    );

    const result = products || [];
    this.logger.log(`[bigbasket] Scraped ${result.length} products for "${query}"`);
    return result;
  }
}
