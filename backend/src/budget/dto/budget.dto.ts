import { IsNumber, Min, IsOptional } from 'class-validator';

export class SetBudgetDto {
  @IsNumber()
  @Min(0)
  monthly_limit: number;
}

export class CheckBudgetDto {
  @IsNumber()
  @Min(0)
  cart_total: number;

  @IsOptional()
  @IsNumber()
  monthly_limit?: number;
}
