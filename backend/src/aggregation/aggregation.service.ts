import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import CircuitBreaker from 'opossum';
import { REDIS_CLIENT } from '../redis/redis.module';
import { CONNECTORS } from '../connectors/connectors.module';
import { Connector, Product } from '../connectors/connector.interface';

/**
 * Aggregation Service — CRITICAL CORE
 * Per 04_BACKEND_SPEC.md §3.2
 *
 * Responsibilities:
 * - Accept search request
 * - Call all connectors in parallel with timeout
 * - Handle failures gracefully (partial results > no results)
 * - Cache results in Redis (TTL: 300s)
 * - Circuit breaker protection per connector
 */

export interface AggregatedItem {
  name: string;
  normalized_name: string;
  options: Product[];
  recommended: {
    platform: string;
    reason: string;
  } | null;
}

export interface AggregationResult {
  items: AggregatedItem[];
  platforms_responded: string[];
  platforms_failed: string[];
}

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);
  private readonly breakers: Map<string, CircuitBreaker> = new Map();

  constructor(
    @Inject(CONNECTORS) private readonly connectors: Connector[],
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    // Initialize circuit breakers for each connector
    for (const connector of this.connectors) {
      const breaker = new CircuitBreaker(
        (query: string, lat: number, lng: number) =>
          connector.search(query, lat, lng),
        {
          timeout: 300, // 300ms per connector (08_CONNECTORS_SPEC.md §6)
          errorThresholdPercentage: 50, // Open circuit at 50% failure rate
          resetTimeout: 60000, // Try again after 1 minute
          volumeThreshold: 5,
        },
      );

      breaker.on('open', () =>
        this.logger.warn(`Circuit OPEN for ${connector.platformName}`),
      );
      breaker.on('halfOpen', () =>
        this.logger.log(`Circuit HALF-OPEN for ${connector.platformName}`),
      );
      breaker.on('close', () =>
        this.logger.log(`Circuit CLOSED for ${connector.platformName}`),
      );

      this.breakers.set(connector.platformName, breaker);
    }
  }

  /**
   * Main aggregation flow per 04_BACKEND_SPEC.md
   */
  async aggregate(
    query: string,
    pincode: string,
    mode: 'cheapest' | 'fastest' | 'balanced' = 'balanced',
  ): Promise<AggregationResult> {
    const { lat, lng } = this.pincodeToCoords(pincode);
    const cacheKey = `search:${query.toLowerCase().trim()}:${pincode}`;

    // 1. Check cache first (cache-first design)
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache HIT for "${cacheKey}"`);
        return JSON.parse(cached);
      }
    } catch (err) {
      // Redis down → skip cache → continue (04_BACKEND_SPEC.md §8 Case 2)
      this.logger.warn(`Redis read failed, skipping cache: ${(err as Error).message}`);
    }

    // 2. Call all connectors in parallel with circuit breakers
    const platformResults = await Promise.allSettled(
      this.connectors.map((connector) => {
        const breaker = this.breakers.get(connector.platformName);
        if (!breaker) {
          return connector.search(query, lat, lng);
        }
        return breaker.fire(query, lat, lng) as Promise<Product[]>;
      }),
    );

    // 3. Collect results and track failures
    const allProducts: Product[] = [];
    const platformsResponded: string[] = [];
    const platformsFailed: string[] = [];

    platformResults.forEach((result, index) => {
      const platformName = this.connectors[index].platformName;
      if (result.status === 'fulfilled' && result.value) {
        allProducts.push(...result.value);
        platformsResponded.push(platformName);
      } else {
        platformsFailed.push(platformName);
        this.logger.warn(
          `Connector ${platformName} failed: ${
            result.status === 'rejected' ? result.reason : 'empty'
          }`,
        );
      }
    });

    // 4. Merge and group by normalized_name
    const merged = this.mergeResults(allProducts, mode);

    const aggregationResult: AggregationResult = {
      items: merged,
      platforms_responded: platformsResponded,
      platforms_failed: platformsFailed,
    };

    // 5. Cache result (TTL: 300s)
    try {
      await this.redis.set(cacheKey, JSON.stringify(aggregationResult), 'EX', 300);
    } catch (err) {
      this.logger.warn(`Redis write failed, skipping cache: ${(err as Error).message}`);
    }

    return aggregationResult;
  }

  /**
   * Merge products by normalized_name and compute recommendations
   * Per 04_BACKEND_SPEC.md §3.5 scoring formula
   */
  private mergeResults(
    products: Product[],
    mode: 'cheapest' | 'fastest' | 'balanced',
  ): AggregatedItem[] {
    const grouped = new Map<string, Product[]>();

    for (const product of products) {
      const key = product.normalized_name;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(product);
    }

    const weights = this.getModeWeights(mode);

    return Array.from(grouped.entries()).map(([normalizedName, options]) => {
      // Compute recommendation based on mode scoring
      const recommended = this.computeRecommendation(options, weights);

      return {
        name: options[0].name,
        normalized_name: normalizedName,
        options,
        recommended,
      };
    });
  }

  private computeRecommendation(
    options: Product[],
    weights: { price: number; eta: number },
  ): { platform: string; reason: string } | null {
    if (options.length === 0) return null;

    const prices = options.map((o) => o.price);
    const etas = options.map((o) => o.eta_minutes);
    const maxPrice = Math.max(...prices);
    const maxEta = Math.max(...etas);

    let bestScore = -Infinity;
    let bestOption: Product = options[0];

    for (const option of options) {
      // Normalize so lower is better → invert the score
      const priceScore = maxPrice > 0 ? (1 - option.price / maxPrice) * 100 : 0;
      const etaScore = maxEta > 0 ? (1 - option.eta_minutes / maxEta) * 100 : 0;

      const score = weights.price * priceScore + weights.eta * etaScore;

      if (score > bestScore) {
        bestScore = score;
        bestOption = option;
      }
    }

    let reason = 'best_overall';
    if (weights.price === 1 && weights.eta === 0) reason = 'lowest_price';
    if (weights.price === 0 && weights.eta === 1) reason = 'fastest_delivery';

    return {
      platform: bestOption.platform,
      reason,
    };
  }

  private getModeWeights(
    mode: 'cheapest' | 'fastest' | 'balanced',
  ): { price: number; eta: number } {
    switch (mode) {
      case 'cheapest':
        return { price: 1, eta: 0 };
      case 'fastest':
        return { price: 0, eta: 1 };
      case 'balanced':
      default:
        return { price: 0.5, eta: 0.5 };
    }
  }

  /**
   * Convert pincode to lat/lng coordinates
   * MVP: hardcoded mapping for common Indian pincodes
   * Growth: will integrate geocoding API
   */
  private pincodeToCoords(pincode: string): { lat: number; lng: number } {
    const pincodeMap: Record<string, { lat: number; lng: number }> = {
      '560067': { lat: 12.97, lng: 77.75 },
      '560001': { lat: 12.98, lng: 77.58 },
      '400001': { lat: 18.93, lng: 72.83 },
      '110001': { lat: 28.64, lng: 77.22 },
      '500001': { lat: 17.38, lng: 78.47 },
      '600001': { lat: 13.06, lng: 80.27 },
    };

    return pincodeMap[pincode] || { lat: 12.97, lng: 77.75 }; // Default to Bangalore
  }
}
