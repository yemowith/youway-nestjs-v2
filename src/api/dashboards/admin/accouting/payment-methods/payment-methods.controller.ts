import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// DTOs for PaymentMethod
export type PaymentMethodResponse = {
  id: string;
  name: string;
  providerKey: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  isActive: boolean;
  sortOrder: number;
  settings: PaymentSettingResponse[];
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentSettingResponse = {
  id: string;
  paymentMethodId: string;
  key: string;
  value: string;
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentMethodInput = {
  name: string;
  providerKey: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  settings?: PaymentSettingInput[];
};

export type PaymentSettingInput = {
  key: string;
  value: string;
  isSecret?: boolean;
};

@ApiTags('Admin - Payment Methods')
@Controller('admin/accouting/payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all payment methods' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: PaymentMethodResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    return this.paymentMethodsService.findAll(
      Number(page),
      Number(pageSize),
      search,
      sortBy,
      sortOrder,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search payment methods by text' })
  async searchPaymentMethods(
    @Query('q') q: string,
  ): Promise<PaymentMethodResponse[]> {
    if (!q || !q.trim()) return [];
    return this.paymentMethodsService.searchByText(q.trim());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment method by ID' })
  async findOne(@Param('id') id: string): Promise<PaymentMethodResponse> {
    return this.paymentMethodsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new payment method' })
  async create(
    @Body() data: PaymentMethodInput,
  ): Promise<PaymentMethodResponse> {
    return this.paymentMethodsService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update payment method' })
  async update(
    @Param('id') id: string,
    @Body() data: PaymentMethodInput,
  ): Promise<PaymentMethodResponse> {
    return this.paymentMethodsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment method' })
  async delete(@Param('id') id: string): Promise<PaymentMethodResponse> {
    return this.paymentMethodsService.delete(id);
  }
}
