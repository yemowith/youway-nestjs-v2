import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSellerPackageItemDto {
  @ApiProperty({
    description: 'Package ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsString()
  packageId: string;

  @ApiProperty({
    description: 'Package price',
    example: 150.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Whether the package is active for this seller',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}

export class UpdateSellerPackagesDto {
  @ApiProperty({
    description: 'Array of seller packages to update',
    type: [UpdateSellerPackageItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSellerPackageItemDto)
  packages: UpdateSellerPackageItemDto[];
}
