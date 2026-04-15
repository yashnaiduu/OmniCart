import { Controller, Post, Get, Body, Req } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { SetBudgetDto, CheckBudgetDto } from './dto/budget.dto';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Budget Controller
 * Per 06_API_CONTRACTS.md §8
 */
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Public()
  @Post()
  async setBudget(@Body() dto: SetBudgetDto, @Req() req: any) {
    const userId = req.user?.sub || 'anonymous';
    return this.budgetService.setBudget(userId, dto.monthly_limit);
  }

  @Public()
  @Get()
  async getBudget(@Req() req: any) {
    const userId = req.user?.sub || 'anonymous';
    return this.budgetService.getBudget(userId);
  }

  @Public()
  @Post('check')
  async checkBudget(@Body() dto: CheckBudgetDto, @Req() req: any) {
    const userId = req.user?.sub || 'anonymous';
    return this.budgetService.checkBudget(userId, dto.cart_total);
  }
}
