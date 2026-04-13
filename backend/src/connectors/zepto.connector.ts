import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';

/**
 * Zepto Mock Connector
 * Per 08_CONNECTORS_SPEC.md — each platform = independent connector
 */
@Injectable()
export class ZeptoConnector implements Connector {
  readonly platformName = 'zepto';
  private readonly logger = new Logger(ZeptoConnector.name);

  private readonly mockCatalog: Record<string, Product[]> = {
    milk: [
      {
        name: 'Amul Gold Full Cream Milk',
        normalized_name: 'milk',
        price: 33,
        currency: 'INR',
        quantity: '500ml',
        platform: 'zepto',
        eta_minutes: 8,
        in_stock: true,
      },
    ],
    bread: [
      {
        name: 'English Oven Sandwich Bread',
        normalized_name: 'bread',
        price: 45,
        currency: 'INR',
        quantity: '400g',
        platform: 'zepto',
        eta_minutes: 8,
        in_stock: true,
      },
    ],
    rice: [
      {
        name: 'Daawat Basmati Rice',
        normalized_name: 'rice',
        price: 210,
        currency: 'INR',
        quantity: '1kg',
        platform: 'zepto',
        eta_minutes: 9,
        in_stock: true,
      },
    ],
    pasta: [
      {
        name: 'Disano Penne Rigate Pasta',
        normalized_name: 'pasta',
        price: 135,
        currency: 'INR',
        quantity: '500g',
        platform: 'zepto',
        eta_minutes: 8,
        in_stock: true,
      },
    ],
    eggs: [
      {
        name: 'Country Eggs (Pack of 6)',
        normalized_name: 'eggs',
        price: 72,
        currency: 'INR',
        quantity: '6 pcs',
        platform: 'zepto',
        eta_minutes: 8,
        in_stock: true,
      },
    ],
    butter: [
      {
        name: 'Amul Pasteurised Butter',
        normalized_name: 'butter',
        price: 56,
        currency: 'INR',
        quantity: '100g',
        platform: 'zepto',
        eta_minutes: 8,
        in_stock: true,
      },
    ],
    cheese: [
      {
        name: 'Gowardhan Cheese Slices',
        normalized_name: 'cheese',
        price: 99,
        currency: 'INR',
        quantity: '200g',
        platform: 'zepto',
        eta_minutes: 8,
        in_stock: true,
      },
    ],
    sauce: [
      {
        name: 'Maggi Hot & Sweet Sauce',
        normalized_name: 'sauce',
        price: 109,
        currency: 'INR',
        quantity: '500g',
        platform: 'zepto',
        eta_minutes: 8,
        in_stock: true,
      },
    ],
  };

  async search(query: string, _lat: number, _lng: number): Promise<Product[]> {
    this.logger.debug(`[zepto] Searching: "${query}"`);
    await this.delay(20 + Math.random() * 40);

    const normalizedQuery = query.toLowerCase().trim();
    const results: Product[] = [];

    for (const [key, products] of Object.entries(this.mockCatalog)) {
      if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
        results.push(...products);
      }
    }

    return results;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
