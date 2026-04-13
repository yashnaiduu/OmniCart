import { Injectable, Logger } from '@nestjs/common';
import { Connector, Product } from './connector.interface';

/**
 * Blinkit Mock Connector
 * MVP implementation using mock data
 * Will be replaced with reverse-engineered API calls in growth phase
 * Per 08_CONNECTORS_SPEC.md §5
 */
@Injectable()
export class BlinkitConnector implements Connector {
  readonly platformName = 'blinkit';
  private readonly logger = new Logger(BlinkitConnector.name);

  private readonly mockCatalog: Record<string, Product[]> = {
    milk: [
      {
        name: 'Amul Taaza Toned Milk',
        normalized_name: 'milk',
        price: 29,
        currency: 'INR',
        quantity: '500ml',
        platform: 'blinkit',
        eta_minutes: 10,
        in_stock: true,
        image_url: 'https://cdn.blinkit.com/mock/milk-amul.jpg',
      },
      {
        name: 'Mother Dairy Full Cream Milk',
        normalized_name: 'milk',
        price: 34,
        currency: 'INR',
        quantity: '500ml',
        platform: 'blinkit',
        eta_minutes: 10,
        in_stock: true,
      },
    ],
    bread: [
      {
        name: 'Harvest Gold White Bread',
        normalized_name: 'bread',
        price: 40,
        currency: 'INR',
        quantity: '400g',
        platform: 'blinkit',
        eta_minutes: 10,
        in_stock: true,
      },
    ],
    rice: [
      {
        name: 'India Gate Basmati Rice',
        normalized_name: 'rice',
        price: 199,
        currency: 'INR',
        quantity: '1kg',
        platform: 'blinkit',
        eta_minutes: 12,
        in_stock: true,
      },
    ],
    pasta: [
      {
        name: 'Barilla Penne Pasta',
        normalized_name: 'pasta',
        price: 149,
        currency: 'INR',
        quantity: '500g',
        platform: 'blinkit',
        eta_minutes: 10,
        in_stock: true,
      },
    ],
    eggs: [
      {
        name: 'Farm Fresh Eggs',
        normalized_name: 'eggs',
        price: 79,
        currency: 'INR',
        quantity: '6 pcs',
        platform: 'blinkit',
        eta_minutes: 10,
        in_stock: true,
      },
    ],
    butter: [
      {
        name: 'Amul Butter',
        normalized_name: 'butter',
        price: 57,
        currency: 'INR',
        quantity: '100g',
        platform: 'blinkit',
        eta_minutes: 10,
        in_stock: true,
      },
    ],
    cheese: [
      {
        name: 'Amul Cheese Slices',
        normalized_name: 'cheese',
        price: 115,
        currency: 'INR',
        quantity: '200g',
        platform: 'blinkit',
        eta_minutes: 10,
        in_stock: true,
      },
    ],
    sauce: [
      {
        name: 'Kissan Fresh Tomato Ketchup',
        normalized_name: 'sauce',
        price: 99,
        currency: 'INR',
        quantity: '500g',
        platform: 'blinkit',
        eta_minutes: 10,
        in_stock: true,
      },
    ],
    sugar: [
      {
        name: 'Trust Classic Sugar',
        normalized_name: 'sugar',
        price: 45,
        currency: 'INR',
        quantity: '1kg',
        platform: 'blinkit',
        eta_minutes: 12,
        in_stock: true,
      },
    ],
    oil: [
      {
        name: 'Fortune Sunflower Oil',
        normalized_name: 'oil',
        price: 155,
        currency: 'INR',
        quantity: '1L',
        platform: 'blinkit',
        eta_minutes: 12,
        in_stock: true,
      },
    ],
  };

  async search(query: string, _lat: number, _lng: number): Promise<Product[]> {
    this.logger.debug(`[blinkit] Searching: "${query}"`);

    // Simulate network latency: 30-80ms
    await this.delay(30 + Math.random() * 50);

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
