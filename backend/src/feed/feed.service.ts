import { Injectable, Logger } from '@nestjs/common';
import { AiEngineService } from '../ai-engine/ai-engine.service';

/**
 * Feed Service
 * Per 06_API_CONTRACTS.md §7 — GET /feed
 * Returns refill suggestions, deals, price drops, recommendations
 *
 * MVP: returns mock data + AI-driven suggestions
 * Growth: will use event-driven price tracking + user history
 */

export interface FeedResponse {
  refill_suggestions: RefillSuggestion[];
  deals: Deal[];
  price_drops: PriceDrop[];
  recommendations: string[];
}

interface RefillSuggestion {
  item: string;
  last_purchased: string;
  suggested_date: string;
}

interface Deal {
  platform: string;
  item: string;
  original_price: number;
  deal_price: number;
  discount_percent: number;
  valid_until: string;
}

interface PriceDrop {
  item: string;
  platform: string;
  old_price: number;
  new_price: number;
  drop_percent: number;
}

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(private readonly aiEngine: AiEngineService) {}

  async getFeed(_userId: string): Promise<FeedResponse> {
    this.logger.log(`Generating feed for user ${_userId}`);

    // MVP: static mock data — will be replaced with real event-driven data
    const refillSuggestions: RefillSuggestion[] = [
      {
        item: 'milk',
        last_purchased: '2026-04-07',
        suggested_date: '2026-04-14',
      },
      {
        item: 'bread',
        last_purchased: '2026-04-10',
        suggested_date: '2026-04-14',
      },
      {
        item: 'eggs',
        last_purchased: '2026-04-06',
        suggested_date: '2026-04-13',
      },
    ];

    const deals: Deal[] = [
      {
        platform: 'blinkit',
        item: 'Amul Butter 500g',
        original_price: 270,
        deal_price: 230,
        discount_percent: 15,
        valid_until: '2026-04-15',
      },
      {
        platform: 'zepto',
        item: 'Maggi Noodles (Pack of 12)',
        original_price: 168,
        deal_price: 140,
        discount_percent: 17,
        valid_until: '2026-04-15',
      },
      {
        platform: 'instamart',
        item: 'Aashirvaad Atta 5kg',
        original_price: 325,
        deal_price: 280,
        discount_percent: 14,
        valid_until: '2026-04-16',
      },
    ];

    const priceDrops: PriceDrop[] = [
      {
        item: 'Fortune Sunflower Oil 1L',
        platform: 'bigbasket',
        old_price: 170,
        new_price: 155,
        drop_percent: 9,
      },
      {
        item: 'Tata Salt 1kg',
        platform: 'blinkit',
        old_price: 28,
        new_price: 24,
        drop_percent: 14,
      },
    ];

    // AI-driven recommendations based on popular co-purchase patterns
    const recommendations = this.aiEngine.getSuggestionsForItems([
      'milk',
      'bread',
      'rice',
    ]);

    return {
      refill_suggestions: refillSuggestions,
      deals,
      price_drops: priceDrops,
      recommendations,
    };
  }
}
