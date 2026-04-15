import { IsString, IsUUID } from 'class-validator';

export class RefillDto {
  @IsString()
  @IsUUID()
  collection_id: string;
}
