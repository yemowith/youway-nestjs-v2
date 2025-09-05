import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderResponseDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';

@ApiTags('Orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create-with-appointment')
  @ApiOperation({
    summary: 'Create order with appointment details',
    description:
      'Creates a new order with appointment details and checks availability before proceeding',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid data or appointment not available',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - appointment availability check failed',
  })
  @UseGuards(JwtAuthGuard)
  async createOrderWithAppointment(
    @Body() dto: CreateOrderDto,
    @Request() req,
  ): Promise<OrderResponseDto> {
    return this.orderService.createOrderWithAppointment(dto, req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Retrieves a specific order by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Order found',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @UseGuards(JwtAuthGuard)
  async getOrderById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<OrderResponseDto | null> {
    return this.orderService.getOrderById(id, req.user.id);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get orders by user ID',
    description: 'Retrieves all orders for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user orders',
    type: [OrderResponseDto],
  })
  @UseGuards(JwtAuthGuard)
  async getUserOrders(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Request() req,
  ): Promise<OrderResponseDto[]> {
    return this.orderService.getUserOrders(req.user.id);
  }
}
