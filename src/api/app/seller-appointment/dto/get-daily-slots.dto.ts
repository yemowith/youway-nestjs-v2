import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetDailySlotsDto {
  @ApiProperty({
    description: 'The ID of the seller',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  sellerId: string;

  @ApiProperty({
    description: 'The ID of the package/service',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  packageId: string;

  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2025-09-01',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  dateStr: string;

  @ApiProperty({
    description: 'Duration of each slot in minutes (default: 15)',
    example: 15,
    required: false,
    minimum: 1,
    maximum: 1440,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440)
  slotMinutes?: number;
}
