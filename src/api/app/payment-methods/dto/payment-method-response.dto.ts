import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodResponseDto {
  @ApiProperty({ description: 'Payment method ID' })
  id: string;

  @ApiProperty({ description: 'Payment method name' })
  name: string;

  @ApiProperty({ description: 'Payment method icon', required: false })
  icon?: string;

  @ApiProperty({ description: 'Payment method color', required: false })
  color?: string;

  @ApiProperty({ description: 'Payment method provider key' })
  providerKey: string;

  @ApiProperty({ description: 'Payment method description', required: false })
  description?: string;

  @ApiProperty({ description: 'Whether the payment method is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Sort order for display' })
  sortOrder: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
