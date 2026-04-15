import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';

/**
 * Swiggy Instamart Connector
 * Note: Instamart blocks headless Chrome entirely ("Something went wrong").
 * This connector gracefully returns [] and logs a warning.
 * When Swiggy fixes their headless detection, the scraper can be re-enabled.
 */
@Injectable()
export class InstamartConnector implements Connector {
  readonly platformName = 'instamart';
  private readonly logger = new Logger(InstamartConnector.name);

  async search(query: string, _lat: number, _lng: number): Promise<Product[]> {
    this.logger.debug(`[instamart] Scraping: "${query}"`);

    // Swiggy Instamart actively blocks headless Chrome (returns "Something went wrong" error page).
    // This is a known platform limitation. The connector gracefully returns [] rather than
    // wasting resources on a request that will always fail.
    //
    // Future options:
    // 1. Use Playwright with stealth plugins (may bypass detection)
    // 2. Use residential proxy rotation
    // 3. Wait for Swiggy to expose a public API
    this.logger.warn('[instamart] Platform blocks headless browsers — returning empty. Consider Playwright stealth for future.');

    return [];
  }
}
