import { ApiProperty } from '@nestjs/swagger';
import { CurrencyDto } from 'src/modules/seller/packages/dto/currency.dto';

export class OrderItemResponseDto {
  @ApiProperty({ description: 'Order item ID' })
  id: string;

  @ApiProperty({ description: 'Package ID' })
  packageId: string;

  @ApiProperty({ description: 'Package name' })
  packageName: string;

  @ApiProperty({ description: 'Package duration in minutes' })
  packageDuration: number;

  @ApiProperty({ description: 'Unit price' })
  unitPrice: any;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiProperty({ description: 'Total price' })
  totalPrice: any;

  @ApiProperty({ description: 'Appointment ID (optional)', required: false })
  appointmentId?: string;

  @ApiProperty({ description: 'Start time (optional)', required: false })
  startTime?: Date;

  @ApiProperty({
    description: 'Additional details (optional)',
    required: false,
  })
  details?: any;
}

export class SellerResponseDto {
  @ApiProperty({ description: 'Seller ID' })
  id: string;

  @ApiProperty({ description: 'Seller firstName' })
  firstName: string;

  @ApiProperty({ description: 'Seller lastName' })
  lastName: string;
}

export class OrderResponseDto {
  @ApiProperty({ description: 'Order ID' })
  id: string;

  @ApiProperty({ description: 'Unique order number' })
  orderNumber: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Seller ID' })
  sellerId: string;

  @ApiProperty({ description: 'Seller' })
  seller: SellerResponseDto;

  @ApiProperty({ description: 'Order status' })
  status: string;

  @ApiProperty({ description: 'Subtotal amount' })
  subtotal: any;

  @ApiProperty({ description: 'Tax amount' })
  taxAmount: any;

  @ApiProperty({ description: 'Discount amount' })
  discountAmount: any;

  @ApiProperty({ description: 'Total amount' })
  totalAmount: any;

  @ApiProperty({ description: 'Customer name (optional)', required: false })
  customerName?: string;

  @ApiProperty({ description: 'Customer email (optional)', required: false })
  customerEmail?: string;

  @ApiProperty({ description: 'Customer phone (optional)', required: false })
  customerPhone?: string;

  @ApiProperty({ description: 'Order notes (optional)', required: false })
  notes?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Payment completion timestamp (optional)',
    required: false,
  })
  paidAt?: Date;

  @ApiProperty({ description: 'Order items', type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ description: 'Currency code' })
  currencyCode: string;

  @ApiProperty({ description: 'Currency' })
  currency: CurrencyDto;
}
