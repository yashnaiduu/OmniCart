import { Controller, Get, Req } from '@nestjs/common';
import { FeedService } from './feed.service';

/**
 * Feed Controller
 * Per 06_API_CONTRACTS.md §7 — GET /feed
 */
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  getFeed(@Req() req: any) {
    return this.feedService.getFeed(req.user.userId);
  }
}
