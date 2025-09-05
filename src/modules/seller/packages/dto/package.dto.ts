import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class PackageDto {
  @ApiProperty({
    description: 'Package unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Package name',
    example: 'Standard Consultation',
  })
  name: string;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 30,
  })
  durationMin: number;

  @ApiProperty({
    description: 'Package image URL (optional)',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  image?: string | null;

  @ApiProperty({
    description: 'Package icon (optional)',
    example: 'consultation-icon',
    required: false,
  })
  icon?: string | null;

  @ApiProperty({
    description: 'Package color (optional)',
    example: '#007bff',
    required: false,
  })
  color?: string | null;

  @ApiProperty({
    description: 'Whether the package is free',
    example: false,
  })
  isFree: boolean;

  @ApiProperty({
    description: 'Whether the package is recommended',
    example: true,
  })
  recommended: boolean;

  @ApiProperty({
    description: 'Sort order for display',
    example: 1,
  })
  sortOrder: number;

  @ApiProperty({
    description: 'Whether the package can be replayed',
    example: false,
  })
  canBeReplayed: boolean;

  @ApiProperty({
    description: 'Whether the package is active',
    example: true,
  })
  isActive: boolean;
}
