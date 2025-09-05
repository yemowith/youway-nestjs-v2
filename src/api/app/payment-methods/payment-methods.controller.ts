import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodResponseDto } from './dto';

@ApiTags('Payment Methods')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all active payment methods',
    description: 'Retrieves all active payment methods ordered by sort order',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active payment methods',
    type: [PaymentMethodResponseDto],
  })
  async getAllPaymentMethods(): Promise<PaymentMethodResponseDto[]> {
    return this.paymentMethodsService.getAllPaymentMethods();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get payment method by ID',
    description: 'Retrieves a specific payment method by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment method ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment method found',
    type: PaymentMethodResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment method not found',
  })
  async getPaymentMethodById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentMethodResponseDto | null> {
    return this.paymentMethodsService.getPaymentMethodById(id);
  }
}
