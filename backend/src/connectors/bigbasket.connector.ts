import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';

/**
 * BigBasket Mock Connector
 * Per 08_CONNECTORS_SPEC.md
 */
@Injectable()
export class BigBasketConnector implements Connector {
  readonly platformName = 'bigbasket';
  private readonly logger = new Logger(BigBasketConnector.name);

  private readonly mockCatalog: Record<string, Product[]> = {
    milk: [
      {
        name: 'Amul Taaza Toned Milk',
        normalized_name: 'milk',
        price: 27,
        currency: 'INR',
        quantity: '500ml',
        platform: 'bigbasket',
        eta_minutes: 30,
        in_stock: true,
      },
    ],
    bread: [
      {
        name: 'BB Royal Multigrain Bread',
        normalized_name: 'bread',
        price: 42,
        currency: 'INR',
        quantity: '400g',
        platform: 'bigbasket',
        eta_minutes: 30,
        in_stock: true,
      },
    ],
    rice: [
      {
        name: 'BB Royal Basmati Rice',
        normalized_name: 'rice',
        price: 175,
        currency: 'INR',
        quantity: '1kg',
        platform: 'bigbasket',
        eta_minutes: 35,
        in_stock: true,
      },
    ],
    pasta: [
      {
        name: 'Borges Penne Pasta',
        normalized_name: 'pasta',
        price: 139,
        currency: 'INR',
        quantity: '500g',
        platform: 'bigbasket',
        eta_minutes: 30,
        in_stock: true,
      },
    ],
    eggs: [
      {
        name: 'Fresho Eggs (Pack of 6)',
        normalized_name: 'eggs',
        price: 59,
        currency: 'INR',
        quantity: '6 pcs',
        platform: 'bigbasket',
        eta_minutes: 30,
        in_stock: true,
      },
    ],
  };

  async search(query: string, _lat: number, _lng: number): Promise<Product[]> {
    this.logger.debug(`[bigbasket] Searching: "${query}"`);
    await this.delay(50 + Math.random() * 70);

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
