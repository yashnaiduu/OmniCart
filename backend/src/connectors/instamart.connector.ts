import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';

/**
 * Instamart (Swiggy) Mock Connector
 * Per 08_CONNECTORS_SPEC.md
 */
@Injectable()
export class InstamartConnector implements Connector {
  readonly platformName = 'instamart';
  private readonly logger = new Logger(InstamartConnector.name);

  private readonly mockCatalog: Record<string, Product[]> = {
    milk: [
      {
        name: 'Nandini Toned Milk',
        normalized_name: 'milk',
        price: 25,
        currency: 'INR',
        quantity: '500ml',
        platform: 'instamart',
        eta_minutes: 15,
        in_stock: true,
      },
    ],
    bread: [
      {
        name: 'Modern Bread White',
        normalized_name: 'bread',
        price: 38,
        currency: 'INR',
        quantity: '400g',
        platform: 'instamart',
        eta_minutes: 15,
        in_stock: true,
      },
    ],
    rice: [
      {
        name: 'Fortune Everyday Basmati Rice',
        normalized_name: 'rice',
        price: 185,
        currency: 'INR',
        quantity: '1kg',
        platform: 'instamart',
        eta_minutes: 18,
        in_stock: true,
      },
    ],
    pasta: [
      {
        name: 'Del Monte Penne Pasta',
        normalized_name: 'pasta',
        price: 120,
        currency: 'INR',
        quantity: '500g',
        platform: 'instamart',
        eta_minutes: 15,
        in_stock: true,
      },
    ],
    eggs: [
      {
        name: 'Fresho Farm Eggs',
        normalized_name: 'eggs',
        price: 65,
        currency: 'INR',
        quantity: '6 pcs',
        platform: 'instamart',
        eta_minutes: 15,
        in_stock: true,
      },
    ],
    butter: [
      {
        name: 'Amul Salted Butter',
        normalized_name: 'butter',
        price: 55,
        currency: 'INR',
        quantity: '100g',
        platform: 'instamart',
        eta_minutes: 15,
        in_stock: true,
      },
    ],
    cheese: [
      {
        name: 'Amul Processed Cheese',
        normalized_name: 'cheese',
        price: 105,
        currency: 'INR',
        quantity: '200g',
        platform: 'instamart',
        eta_minutes: 15,
        in_stock: true,
      },
    ],
    sauce: [
      {
        name: 'Kissan Tomato Ketchup',
        normalized_name: 'sauce',
        price: 95,
        currency: 'INR',
        quantity: '500g',
        platform: 'instamart',
        eta_minutes: 15,
        in_stock: true,
      },
    ],
  };

  async search(query: string, _lat: number, _lng: number): Promise<Product[]> {
    this.logger.debug(`[instamart] Searching: "${query}"`);
    await this.delay(40 + Math.random() * 60);

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
