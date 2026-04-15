import { Controller, Get, Req } from '@nestjs/common';
import { FeedService } from './feed.service';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Feed Controller
 * Per 06_API_CONTRACTS.md §7 — GET /feed
 */
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Public()
  @Get()
  getFeed(@Req() req: any) {
    const userId = req.user?.sub || 'anonymous';
    return this.feedService.getFeed(userId);
  }
}
