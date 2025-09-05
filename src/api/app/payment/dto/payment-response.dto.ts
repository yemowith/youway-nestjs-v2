import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { CurrencyDto } from 'src/modules/seller/packages/dto/currency.dto';

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  paymentMethodId: string;

  @ApiProperty()
  currencyCode: string;

  @ApiProperty({ required: false, nullable: true })
  orderId?: string | null;

  @ApiProperty()
  amount: any;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ required: false, nullable: true })
  transactionId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ required: false, nullable: true })
  paidAt?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  currency: CurrencyDto;
}
