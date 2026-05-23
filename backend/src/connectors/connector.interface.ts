/**
 * Connector Interface — STRICT CONTRACT
 * Per 08_CONNECTORS_SPEC.md §4
 *
 * Every platform connector must implement this interface.
 * Each platform = independent connector service.
 */
export interface Product {
  platform: 'swiggy' | 'blinkit' | 'zepto' | 'bigbasket' | 'amazon' | string;
  productId: string;
  name: string;
  normalized_name: string;
  brand?: string;
  imageUrl: string;
  productUrl?: string;
  price: {
    current: number;
    original?: number;
    discount?: number;
    discountPercentage?: number;
  };
  inventory: {
    inStock: boolean;
    quantity?: number;
  };
  delivery: {
    eta: number; // minutes
    etaText: string;
    fee?: number;
    minOrder?: number;
  };
  metadata: {
    rating?: number;
    reviewCount?: number;
    weight?: string;
    unit?: string;
  };
  scrapedAt: Date;
}

export interface Connector {
  readonly platformName: string;

  /**
   * Search for products on this platform.
   * Must resolve within 300ms (timeout enforced externally).
   * Must return partial results on failure.
   */
  search(query: string, lat: number, lng: number): Promise<Product[]>;
}
