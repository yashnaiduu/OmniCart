import { IsString, Length, IsEnum, IsOptional, Matches } from 'class-validator';

/**
 * Search DTO per 06_API_CONTRACTS.md §4
 */
export enum SearchMode {
  CHEAPEST = 'cheapest',
  FASTEST = 'fastest',
  BALANCED = 'balanced',
}

export class SearchDto {
  @IsString()
  @Length(1, 200)
  query: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'Pincode must be exactly 6 digits' })
  pincode: string;

  @IsOptional()
  @IsEnum(SearchMode)
  mode?: SearchMode = SearchMode.BALANCED;
}
