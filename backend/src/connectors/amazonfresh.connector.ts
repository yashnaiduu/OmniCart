import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';
import { scrapePage } from './browser-pool';
import type { Page } from 'playwright';

/**
 * Amazon Fresh Connector — Playwright Stealth
 * Navigates to https://www.amazon.in/s?k={query}&i=nowstore
 * Extracts product cards from Amazon's Now Store index
 */
@Injectable()
export class AmazonFreshConnector implements Connector {
  readonly platformName = 'amazonfresh';
  private readonly logger = new Logger(AmazonFreshConnector.name);

  async search(query: string, lat: number, lng: number): Promise<Product[]> {
    this.logger.debug(`[amazonfresh] Scraping: "${query}"`);

    const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}&i=nowstore`;

    const products = await scrapePage<Product[]>(
      url,
      async (page: Page) => {
        return page.evaluate((q: string) => {
          const items: any[] = [];

          // Amazon uses s-result-item cards
          const cards = document.querySelectorAll(
            '[data-component-type="s-search-result"], .s-result-item[data-asin]'
          );

          cards.forEach((card) => {
            const asin = card.getAttribute('data-asin');
            if (!asin) return;

            const nameEl = card.querySelector('h2 a span, h2 span, .a-text-normal');
            const imgEl = card.querySelector('img.s-image');

            const name = nameEl?.textContent?.trim();
            if (!name) return;

            let price = 0;
            const offscreen = card.querySelector('.a-price .a-offscreen');
            if (offscreen) {
              price = parseFloat(offscreen.textContent?.replace(/[^\d.]/g, '') || '0');
            } else {
              const whole = card.querySelector('.a-price-whole');
              if (whole) price = parseFloat(whole.textContent?.replace(/[^\d.]/g, '') || '0');
            }

            items.push({
              name,
              normalized_name: name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
              price,
              currency: 'INR',
              quantity: '',
              platform: 'amazonfresh',
              eta_minutes: 120,
              in_stock: true,
              image_url: (imgEl as HTMLImageElement)?.src || undefined,
              product_url: `https://www.amazon.in/dp/${asin}`,
            });
          });

          return items;
        }, query);
      },
      5000,
      lat,
      lng,
    );

    const result = products || [];
    this.logger.log(`[amazonfresh] Scraped ${result.length} products for "${query}"`);
    return result;
  }
}
