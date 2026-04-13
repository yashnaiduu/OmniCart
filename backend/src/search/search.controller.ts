import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';

/**
 * Search Controller
 * Per 06_API_CONTRACTS.md §4
 *
 * POST /api/v1/search — full search with aggregation
 * GET  /api/v1/search/suggestions — real-time typing suggestions
 */
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async search(@Body() dto: SearchDto) {
    return this.searchService.search(dto.query, dto.pincode, dto.mode);
  }

  @Get('suggestions')
  getSuggestions(@Query('q') query: string) {
    if (!query || query.trim().length === 0) {
      return { suggestions: [] };
    }
    const suggestions = this.searchService.getSuggestions(query);
    return { suggestions };
  }
}
