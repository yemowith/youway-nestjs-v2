import { ApiProperty } from '@nestjs/swagger';

export class CurrencyDto {
  @ApiProperty({
    description: 'Currency code (e.g., TRY, USD, EUR)',
    example: 'TRY',
  })
  code: string;

  @ApiProperty({
    description: 'Currency name',
    example: 'Turkish Lira',
  })
  name: string;

  @ApiProperty({
    description: 'Currency symbol',
    example: '₺',
  })
  symbol: string;

  @ApiProperty({
    description: 'ISO currency code',
    example: 'TRY',
  })
  isoCode: string;

  @ApiProperty({
    description: 'Left currency code (optional)',
    example: 'TRY',
    required: false,
  })
  leftCode?: string | null;

  @ApiProperty({
    description: 'Right currency code (optional)',
    example: 'TRY',
    required: false,
  })
  rightCode?: string | null;

  @ApiProperty({
    description: 'Whether this is the default currency',
    example: true,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-09-01T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-09-01T10:00:00.000Z',
  })
  updatedAt: Date;
}
