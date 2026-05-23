import { IsNumber, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateLocationDto {
  @ApiProperty({ description: 'Latitude coordinate' })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiPropertyOptional({ description: 'City name' })
  @IsString()
  @IsOptional()
  city?: string;
}

export class SaveLocationDto extends ValidateLocationDto {
  @ApiPropertyOptional({ description: 'Accuracy in meters' })
  @IsNumber()
  @IsOptional()
  accuracy?: number;
}
