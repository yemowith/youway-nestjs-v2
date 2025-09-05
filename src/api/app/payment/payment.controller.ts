import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentForOrderDto, PaymentResponseDto } from './dto';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

@ApiTags('Payments')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('order/:orderId')
  @ApiOperation({ summary: 'Create a payment row for an order' })
  @ApiParam({ name: 'orderId', type: 'string', format: 'uuid' })
  @ApiBody({ type: CreatePaymentForOrderDto })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  @UseGuards(JwtAuthGuard)
  async createPaymentForOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: CreatePaymentForOrderDto,
    @Request() req,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.createPaymentForOrder(orderId, dto, req.user.id);
  }

  @Post(':paymentId/process')
  @ApiOperation({ summary: 'Process a payment by selected method' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Provider payload returned if applicable',
  })
  @UseGuards(JwtAuthGuard)
  async processPayment(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Request() req: ExpressRequest & { user: { id: string } },
  ): Promise<{ payment: PaymentResponseDto; providerPayload?: any }> {
    const userIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      (req.socket && 'remoteAddress' in req.socket
        ? (req.socket as any).remoteAddress
        : undefined) ||
      '127.0.0.1';
    return this.paymentService.processPayment(paymentId, req.user.id, userIp);
  }
}
