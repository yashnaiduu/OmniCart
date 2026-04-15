import { Controller, Post, Body, Req } from '@nestjs/common';
import { RefillService } from './refill.service';
import { RefillDto } from './dto/refill.dto';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Refill Controller
 * POST /api/v1/refill — Re-order a collection with live prices
 * Per 06_API_CONTRACTS.md §6
 */
@Controller('refill')
export class RefillController {
  constructor(private readonly refillService: RefillService) {}

  @Public()
  @Post()
  async refill(@Body() dto: RefillDto, @Req() req: any) {
    const userId = req.user?.sub || 'anonymous';
    const pincode = req.body?.pincode || '560067';
    const mode = req.body?.mode || 'balanced';

    return this.refillService.refill(userId, dto.collection_id, pincode, mode);
  }
}
