import { Injectable, Logger } from '@nestjs/common';

/**
 * Price Alerts Service
 * Per 06_API_CONTRACTS.md §9, 10_GROWTH_LAYER_SPEC.md §2.4
 *
 * MVP: in-memory price alert tracking
 * Growth: will use event-driven price comparison with background jobs
 */

export interface PriceAlert {
  id: string;
  item: string;
  platform: string;
  target_price: number;
  current_price: number;
  triggered: boolean;
  created_at: string;
}

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  // MVP: in-memory alert store per user
  private alerts = new Map<string, PriceAlert[]>();
  private idCounter = 0;

  async createAlert(userId: string, item: string, platform: string, targetPrice: number) {
    this.logger.log(`Creating alert: ${item} on ${platform} at ₹${targetPrice} for ${userId}`);

    const alert: PriceAlert = {
      id: `alert-${++this.idCounter}`,
      item,
      platform,
      target_price: targetPrice,
      current_price: 0,
      triggered: false,
      created_at: new Date().toISOString(),
    };

    const userAlerts = this.alerts.get(userId) || [];
    userAlerts.push(alert);
    this.alerts.set(userId, userAlerts);

    return alert;
  }

  async getAlerts(userId: string): Promise<PriceAlert[]> {
    return this.alerts.get(userId) || [];
  }

  async deleteAlert(userId: string, alertId: string) {
    const userAlerts = this.alerts.get(userId) || [];
    this.alerts.set(
      userId,
      userAlerts.filter((a) => a.id !== alertId),
    );
    return { deleted: true };
  }
}
