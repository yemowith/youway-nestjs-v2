import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { CurrencyDto } from 'src/modules/seller/packages/dto/currency.dto';

export class CountryDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  currencyCode: string;

  @IsString()
  timezone: string;

  @IsOptional()
  isDefault?: boolean;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;

  @IsOptional()
  currency?: CurrencyDto;
}

export class UserLocationDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  countryId: string;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;

  @IsOptional()
  country?: CountryDto;
}
