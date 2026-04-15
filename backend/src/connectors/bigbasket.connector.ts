import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';
import { scrapePage } from './browser-pool';

/**
 * BigBasket Connector — Headless Chrome
 * Verified: Products render as a[href*="/pd/"] links with h3 product names
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
        // Wait extra for lazy-loaded product grid
        await new Promise((r) => setTimeout(r, 3000));

        return page.evaluate((q: string) => {
          const items: any[] = [];
          const seen = new Set<string>();

          // BigBasket product links contain /pd/ in href
          const links = document.querySelectorAll('a[href*="/pd/"]');

          links.forEach((link) => {
            // Walk up to find the product card container
            const card = link.closest('li') || link.closest('div') || link;

            const nameEl = card.querySelector('h3') || link.querySelector('h3');
            const name = nameEl?.textContent?.trim();
            if (!name || seen.has(name)) return;
            seen.add(name);

            // Find price — look for ₹ symbol in nearby text
            const allSpans = card.querySelectorAll('span');
            let price = 0;
            let weight = '';
            for (const span of allSpans) {
              const text = span.textContent?.trim() || '';
              if (text.startsWith('₹') || /^\d+$/.test(text)) {
                const parsed = parseFloat(text.replace(/[^\d.]/g, ''));
                if (parsed > 0 && price === 0) price = parsed;
              }
              // Weight patterns
              if (/\d+\s*(g|kg|ml|l|pack|pcs|pouch)/i.test(text) && !weight) {
                weight = text;
              }
            }

            items.push({
              name,
              normalized_name: q.toLowerCase(),
              price,
              currency: 'INR',
              quantity: weight,
              platform: 'bigbasket',
              eta_minutes: 30,
              in_stock: true,
              product_url: 'https://www.bigbasket.com' + (link as HTMLAnchorElement).getAttribute('href'),
            });
          });

          return items.slice(0, 15);
        }, query);
      },
      5000,
    );

    const result = products || [];
    this.logger.log(`[bigbasket] Scraped ${result.length} products for "${query}"`);
    return result;
  }
}
