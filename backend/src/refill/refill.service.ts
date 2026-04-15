import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AggregationService } from '../aggregation/aggregation.service';
import { AiEngineService } from '../ai-engine/ai-engine.service';

/**
 * Refill Service — One-Tap Reorder
 * Per 06_API_CONTRACTS.md §6, 10_GROWTH_LAYER_SPEC.md §2.1
 *
 * Flow:
 * 1. Fetch collection by ID
 * 2. Extract all item names
 * 3. Re-run aggregation for current prices
 * 4. Return fresh results (same format as /search response)
 */
@Injectable()
export class RefillService {
  private readonly logger = new Logger(RefillService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aggregation: AggregationService,
    private readonly aiEngine: AiEngineService,
  ) {}

  async refill(userId: string, collectionId: string, pincode: string, mode: 'cheapest' | 'fastest' | 'balanced' = 'balanced') {
    this.logger.log(`Refill: collection=${collectionId}, user=${userId}`);

    // 1. Fetch collection with items
    const collection = await this.prisma.collection.findFirst({
      where: { id: collectionId, userId },
      include: { items: true },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (!collection.items || collection.items.length === 0) {
      return {
        collection_name: collection.name,
        items: [],
        suggestions: [],
        platforms_responded: [],
        platforms_failed: [],
      };
    }

    // 2. Build search query from collection items
    const itemNames = collection.items.map((i) => i.normalizedName || i.name).filter(Boolean) as string[];
    const searchQuery = itemNames.join(' ');

    // 3. Re-run aggregation for fresh live prices
    const aggregationResult = await this.aggregation.aggregate(searchQuery, pincode, mode);

    // 4. Get co-purchase suggestions
    const suggestions = this.aiEngine.getSuggestionsForItems(itemNames);

    return {
      collection_name: collection.name,
      items: aggregationResult.items,
      suggestions,
      platforms_responded: aggregationResult.platforms_responded,
      platforms_failed: aggregationResult.platforms_failed,
    };
  }
}
