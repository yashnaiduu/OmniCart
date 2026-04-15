import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

/**
 * Budget Guardian Service
 * Per 06_API_CONTRACTS.md §8, 10_GROWTH_LAYER_SPEC.md §2.6
 *
 * Logic:
 * - Store user's monthly budget limit
 * - Check if cart total exceeds budget
 * - Suggest cheaper alternatives if over budget
 */
@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);

  // MVP: in-memory store (will migrate to DB in growth phase)
  private budgets = new Map<string, number>();

  constructor(private readonly prisma: PrismaService) {}

  async setBudget(userId: string, monthlyLimit: number) {
    this.logger.log(`Setting budget for ${userId}: ₹${monthlyLimit}`);
    this.budgets.set(userId, monthlyLimit);
    return { monthly_limit: monthlyLimit, status: 'set' };
  }

  async getBudget(userId: string) {
    const limit = this.budgets.get(userId) || null;
    return { monthly_limit: limit };
  }

  async checkBudget(userId: string, cartTotal: number) {
    const limit = this.budgets.get(userId);

    if (!limit) {
      // No budget set — skip check per 10_GROWTH_LAYER_SPEC.md §5 Case 2
      return {
        within_budget: true,
        budget_set: false,
        message: 'No budget set',
      };
    }

    const remaining = limit - cartTotal;
    const withinBudget = cartTotal <= limit;

    return {
      within_budget: withinBudget,
      budget_set: true,
      monthly_limit: limit,
      cart_total: cartTotal,
      remaining: Math.max(0, remaining),
      overage: withinBudget ? 0 : Math.abs(remaining),
      message: withinBudget
        ? `₹${remaining.toFixed(0)} remaining in your budget`
        : `Over budget by ₹${Math.abs(remaining).toFixed(0)} — consider cheaper alternatives`,
    };
  }
}
