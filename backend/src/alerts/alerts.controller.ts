import { Controller, Post, Get, Delete, Body, Param, Req } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Alerts Controller
 * Per 06_API_CONTRACTS.md §9
 */
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Public()
  @Post()
  async createAlert(
    @Body() body: { item: string; platform: string; target_price: number },
    @Req() req: any,
  ) {
    const userId = req.user?.sub || 'anonymous';
    return this.alertsService.createAlert(userId, body.item, body.platform, body.target_price);
  }

  @Public()
  @Get()
  async getAlerts(@Req() req: any) {
    const userId = req.user?.sub || 'anonymous';
    return this.alertsService.getAlerts(userId);
  }

  @Public()
  @Delete(':id')
  async deleteAlert(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || 'anonymous';
    return this.alertsService.deleteAlert(userId, id);
  }
}
