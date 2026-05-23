import { Injectable, Logger } from '@nestjs/common';
import { AggregationService } from '../aggregation/aggregation.service';
import { AiEngineService } from '../ai-engine/ai-engine.service';
import { SearchDto } from './dto/search.dto';

/**
 * Search Service — Orchestrator
 * Wires together AI Engine (parsing + suggestions) with Aggregation (connector calls)
 *
 * Flow:
 * 1. Parse user input → structured items (AI Engine)
 * 2. For each item, call aggregation service
 * 3. Attach co-purchase suggestions
 * 4. Return merged, scored results
 */
@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly aggregationService: AggregationService,
    private readonly aiEngineService: AiEngineService,
  ) {}

  async search(dto: SearchDto) {
    const { query, pincode, mode = 'balanced', latitude, longitude, city } = dto;
    this.logger.log(`Search: "${query}" | loc: ${city || pincode || 'unknown'} | mode: ${mode}`);
    const start = Date.now();

    // 1. Parse input through AI Engine
    const parsedItems = this.aiEngineService.parseInput(query);

    if (parsedItems.length === 0) {
      return {
        items: [],
        suggestions: [],
        parsed_items: [],
        platforms_responded: [],
        platforms_failed: [],
      };
    }

    // 2. Build individual search queries from parsed items
    const searchQueries = parsedItems.map((p) => p.item);

    // 3. Aggregate results for all items
    const aggregationResult = await this.aggregationService.aggregate({
      ...dto,
      query: searchQueries.join(' '), // override query with parsed AI response
    });

    // 4. Get co-purchase suggestions
    const suggestions = this.aiEngineService.getSuggestionsForItems(
      searchQueries,
    );

    const latency = Date.now() - start;
    this.logger.log(`Search completed in ${latency}ms`);

    return {
      items: aggregationResult.items,
      suggestions,
      parsed_items: parsedItems,
      platforms_responded: aggregationResult.platforms_responded,
      platforms_failed: aggregationResult.platforms_failed,
    };
  }

  /**
   * Get real-time suggestions as user types
   */
  getSuggestions(query: string): string[] {
    return this.aiEngineService.getSuggestions(query);
  }
}
