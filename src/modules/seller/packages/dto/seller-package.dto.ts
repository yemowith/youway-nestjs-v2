import { ApiProperty } from '@nestjs/swagger';
import { PackageDto } from './package.dto';
import { CurrencyDto } from './currency.dto';
import { Decimal } from '@prisma/client/runtime/library';

export class SellerPackageDto {
  @ApiProperty({
    description: 'Seller user ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  sellerId: string;

  @ApiProperty({
    description: 'Package ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  packageId: string;

  @ApiProperty({
    description: 'Package price',
    example: '150.00',
  })
  price: Decimal;

  @ApiProperty({
    description: 'Currency code',
    example: 'TRY',
  })
  currencyCode: string;

  @ApiProperty({
    description: 'Package details',
    type: PackageDto,
  })
  package: PackageDto;

  @ApiProperty({
    description: 'Currency details',
    type: CurrencyDto,
  })
  currency: CurrencyDto;
}
