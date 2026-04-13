import {
  IsString,
  Length,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum CollectionType {
  RECURRING = 'recurring',
  ONE_TIME = 'one_time',
  WISHLIST = 'wishlist',
}

export enum CollectionFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

export class CreateCollectionDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsOptional()
  @IsEnum(CollectionType)
  type?: CollectionType;

  @IsOptional()
  @IsEnum(CollectionFrequency)
  frequency?: CollectionFrequency;
}

export class AddCollectionItemDto {
  @IsString()
  @Length(1, 200)
  name: string;

  @IsOptional()
  @IsString()
  quantity?: string;
}
