import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreatePaymentForOrderDto {
  @ApiPropertyOptional({ description: 'Payment method ID (UUID)' })
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @ApiPropertyOptional({
    description: 'Payment provider key, e.g. "paytr" or "iban"',
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  providerKey?: string;

  @ApiPropertyOptional({
    description: 'Custom amount; defaults to order totalAmount',
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Override currency code; defaults to order currency',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currencyCode?: string;

  @ApiPropertyOptional({
    description: 'Optional description for the payment row',
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;
}
