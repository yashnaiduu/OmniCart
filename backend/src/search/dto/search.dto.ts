import { IsString, Length, IsEnum, IsOptional, Matches, IsNumber } from 'class-validator';

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

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  pincode?: string; // Keep for backward compatibility or specific scrapers

  @IsOptional()
  @IsEnum(SearchMode)
  mode?: SearchMode = SearchMode.BALANCED;
}
