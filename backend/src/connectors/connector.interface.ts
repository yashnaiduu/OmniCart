/**
 * Connector Interface — STRICT CONTRACT
 * Per 08_CONNECTORS_SPEC.md §4
 *
 * Every platform connector must implement this interface.
 * Each platform = independent connector service.
 */
export interface Product {
  name: string;
  normalized_name: string;
  price: number;
  currency: string;
  quantity: string;
  platform: string;
  eta_minutes: number;
  in_stock: boolean;
  product_url?: string;
  image_url?: string;
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
