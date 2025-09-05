import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';

export class PaymentMethodDto {
  @ApiProperty({ description: 'Payment method ID' })
  id: string;

  @ApiProperty({ description: 'Payment method name' })
  name: string;

  @ApiProperty({ description: 'Payment method icon', required: false })
  icon: string | null;

  @ApiProperty({ description: 'Payment method color', required: false })
  color: string | null;

  @ApiProperty({ description: 'Provider key' })
  providerKey: string;

  @ApiProperty({ description: 'Description', required: false })
  description: string | null;
}

export class PaymentDto {
  @ApiProperty({ description: 'Payment ID' })
  id: string;

  @ApiProperty({ description: 'Payment method ID' })
  paymentMethodId: string;

  @ApiProperty({
    description: 'Payment method details',
    type: PaymentMethodDto,
  })
  paymentMethod: PaymentMethodDto;

  @ApiProperty({ description: 'Order ID', required: false })
  orderId: string | null;

  @ApiProperty({ description: 'Order number', required: false })
  orderNumber: string | null;

  @ApiProperty({ description: 'Payment amount' })
  amount: number;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ description: 'Transaction ID', required: false })
  transactionId: string | null;

  @ApiProperty({ description: 'Payment description', required: false })
  description: string | null;

  @ApiProperty({ description: 'Currency code' })
  currencyCode: string;

  @ApiProperty({ description: 'Payment date', required: false })
  paidAt: Date | null;

  @ApiProperty({ description: 'Payment creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Payment update date' })
  updatedAt: Date;
}

export class PaginationDto {
  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of items' })
  totalCount: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage: boolean;
}

export class UserPaymentsResponseDto {
  @ApiProperty({ description: 'List of payments', type: [PaymentDto] })
  payments: PaymentDto[];

  @ApiProperty({ description: 'Pagination information', type: PaginationDto })
  pagination: PaginationDto;
}
