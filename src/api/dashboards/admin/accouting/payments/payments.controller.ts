import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

// DTOs for Payment
export type PaymentResponse = {
  id: string;
  appointmentId: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
  status: string;
  transactionId?: string | null;
  description?: string | null;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  appointment?: {
    id: string;
    userId: string;
    sellerId: string;
    packageId: string;
    status: string;
  };
  paymentMethod?: {
    id: string;
    name: string;
    providerKey: string;
  };
};

export type PaymentInput = {
  appointmentId: string;
  paymentMethodId: string;
  amount: number;
  currency?: string;
  status?: string;
  transactionId?: string | null;
  description?: string | null;
  paidAt?: Date | null;
};

@ApiTags('Payments')
@Controller('admin/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all payments with pagination and search' })
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    return this.paymentsService.findAll(
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search payments by text' })
  async searchPayments(@Query('q') q: string) {
    return this.paymentsService.searchByText(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  async create(@Body() createPaymentDto: PaymentInput) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payment' })
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: PaymentInput,
  ) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment' })
  async remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
