import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SellerAvailabilityDto {
  @ApiProperty({
    description: 'Day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)',
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({
    description: 'Start time in HH:MM format',
    example: '09:00',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'End time in HH:MM format',
    example: '17:00',
  })
  @IsString()
  endTime: string;

  @ApiProperty({
    description: 'Whether the seller is available on this day',
    example: true,
  })
  @IsBoolean()
  isAvailable: boolean;
}

export class SellerSettingsDto {
  @ApiProperty({
    description: 'Whether the seller is active for appointments',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Maximum number of appointments per day',
    example: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsNumber()
  @Min(1)
  @Max(50)
  maxDailyAppointments: number;

  @ApiProperty({
    description: 'Duration between appointments in minutes',
    example: 15,
    minimum: 0,
    maximum: 120,
  })
  @IsNumber()
  @Min(0)
  @Max(120)
  durationBetweenAppointments: number;
}

export class UpdateAvailabilitySettingsDto {
  @ApiProperty({
    description: 'Seller availability for each day of the week',
    type: [SellerAvailabilityDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SellerAvailabilityDto)
  sellerAvailability: SellerAvailabilityDto[];

  @ApiProperty({
    description: 'Seller appointment settings',
    type: SellerSettingsDto,
  })
  @ValidateNested()
  @Type(() => SellerSettingsDto)
  sellerSettings: SellerSettingsDto;
}

export class SellerAvailabilityResponseDto {
  @ApiProperty({
    description: 'Seller availability for each day of the week',
    type: [SellerAvailabilityDto],
  })
  sellerAvailability: SellerAvailabilityDto[];

  @ApiProperty({
    description: 'Seller appointment settings',
    type: SellerSettingsDto,
  })
  sellerSetting: SellerSettingsDto;
}

export class CreateSellerUnavailabilityDto {
  @ApiProperty({
    description: 'Start time of unavailability period in ISO format',
    example: '2024-01-15T09:00:00.000Z',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'End time of unavailability period in ISO format',
    example: '2024-01-15T17:00:00.000Z',
  })
  @IsString()
  endTime: string;

  @ApiProperty({
    description: 'Reason for unavailability',
    example: 'Personal vacation',
  })
  @IsString()
  reason: string;
}

export class SellerUnavailabilityResponseDto {
  @ApiProperty({
    description: 'Unavailability ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Seller ID',
    example: 'uuid-string',
  })
  sellerId: string;

  @ApiProperty({
    description: 'Start time of unavailability period',
    example: '2024-01-15T09:00:00.000Z',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time of unavailability period',
    example: '2024-01-15T17:00:00.000Z',
  })
  endTime: string;

  @ApiProperty({
    description: 'Reason for unavailability',
    example: 'Personal vacation',
  })
  reason: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: string;
}
