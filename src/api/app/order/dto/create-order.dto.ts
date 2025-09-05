import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  IsUUID,
  IsNumber,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Package ID' })
  @IsUUID()
  packageId: string;

  @ApiProperty({
    description:
      'Start time for appointment as timestamp (milliseconds since epoch)',
    required: false,
    example: '10:00:00',
  })
  @IsString()
  hour: string;

  @ApiProperty({
    description: 'Date string for appointment',
    required: false,
    example: '2021-01-01',
  })
  @IsOptional()
  dateStr: string;

  @ApiProperty({
    description: 'Quantity (default: 1)',
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({
    description: 'Additional details as JSON (optional)',
    required: false,
  })
  @IsOptional()
  details?: any;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Seller ID' })
  @IsUUID()
  sellerId: string;

  @ApiProperty({ description: 'Order items', type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ description: 'Customer name (optional)', required: false })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ description: 'Customer email (optional)', required: false })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiProperty({ description: 'Customer phone (optional)', required: false })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ description: 'Order notes (optional)', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Currency code (default: TRY)',
    required: false,
    default: 'TRY',
  })
  @IsOptional()
  @IsString()
  currencyCode?: string;
}
