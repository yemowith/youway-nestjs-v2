import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';

import { CreateOrderDto, CreateOrderItemDto, OrderResponseDto } from './dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderItem, OrderStatus } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { AppointmentService } from 'src/modules/seller/appointment/appointment.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly appointmentsService: AppointmentService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `${timestamp}${random}`;
  }

  /**
   * Create order with appointment details
   */
  async createOrderWithAppointment(
    dto: CreateOrderDto,
    userId: string,
  ): Promise<OrderResponseDto> {
    const {
      sellerId,
      items,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    } = dto;

    // Validate items
    if (!items || items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    // Calculate totals and process items
    let subtotal = 0;
    let currencyCode = 'TRY';
    const orderItems: any[] = [];

    // Process each item
    for (const item of items) {
      const sellerPackage = await this.prisma.sellerPackage.findUnique({
        where: {
          sellerId_packageId: {
            sellerId,
            packageId: item.packageId,
          },
        },
        include: {
          package: true,
          currency: {
            select: {
              code: true,
            },
          },
        },
      });

      if (!sellerPackage) {
        throw new BadRequestException(`Package not found: ${item.packageId}`);
      }

      let appointmentId;

      try {
        const appointment = await this.appointmentsService.createAppointment({
          userId,
          sellerId,
          packageId: item.packageId,
          hour: item.hour, // startTime is now a timestamp from frontend
          dateStr: item.dateStr, // Let the service calculate end time
        });

        appointmentId = appointment.id;
      } catch (error) {
        throw new BadRequestException(
          `Failed to create appointment for package ${item.packageId}: ${error.message}`,
        );
      }

      const quantity = item.quantity || 1;
      const unitPrice = Number(sellerPackage.price);
      const totalPrice = unitPrice * quantity;

      subtotal += totalPrice;
      currencyCode = sellerPackage.currency.code;

      orderItems.push({
        packageId: sellerPackage.package.id,
        packageName: sellerPackage.package.name,
        packageDuration: sellerPackage.package.durationMin,
        unitPrice: new Decimal(unitPrice),
        quantity,
        totalPrice: new Decimal(totalPrice),
        appointmentId,
        details: item.details,
        hour: item.hour,
        dateStr: item.dateStr,
      });
    }

    const taxAmount = 0;
    const discountAmount = 0; // Calculate discount if needed
    const totalAmount = subtotal + taxAmount - discountAmount;

    // Create order
    const order = await this.prisma.order.create({
      data: {
        orderNumber: this.generateOrderNumber(),
        userId,
        sellerId,
        currencyCode,
        status: OrderStatus.PENDING,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        customerName,
        customerEmail,
        customerPhone,
        notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        currency: true,
      },
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      sellerId: order.sellerId,
      seller: order.seller,
      status: order.status,
      subtotal: order.subtotal,
      currencyCode: order.currencyCode,
      currency: order.currency,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: order.paidAt || undefined,
      items: order.items.map((item) => ({
        id: item.id,
        packageId: item.packageId,
        packageName: item.packageName,
        packageDuration: item.packageDuration,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        appointmentId: item.appointmentId || undefined,
        hour: item.hour || undefined,
        details: item.details || undefined,
      })),
    };
  }

  /**
   * Get order by ID
   */
  async getOrderById(
    orderId: string,
    userId?: string,
  ): Promise<OrderResponseDto | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, userId },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        currency: true,
      },
    });

    if (!order) {
      return null;
    }

    if (userId && order.userId !== userId) {
      throw new BadRequestException(
        'Order does not belong to the specified user',
      );
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      sellerId: order.sellerId,
      seller: order.seller,
      status: order.status,
      subtotal: order.subtotal,
      currencyCode: order.currencyCode,
      currency: order.currency,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      customerName: order.customerName || undefined,
      customerEmail: order.customerEmail || undefined,
      customerPhone: order.customerPhone || undefined,
      notes: order.notes || undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: order.paidAt || undefined,
      items: order.items.map((item) => ({
        id: item.id,
        packageId: item.packageId,
        packageName: item.packageName,
        packageDuration: item.packageDuration,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        appointmentId: item.appointmentId || undefined,
        hour: item.hour || undefined,
        details: item.details || undefined,
      })),
    };
  }

  /**
   * Get orders by user ID
   */
  async getUserOrders(userId: string): Promise<OrderResponseDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        currency: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      sellerId: order.sellerId,
      seller: order.seller,
      status: order.status,
      subtotal: order.subtotal,
      currencyCode: order.currencyCode,
      currency: order.currency,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      customerName: order.customerName || undefined,
      customerEmail: order.customerEmail || undefined,
      customerPhone: order.customerPhone || undefined,
      notes: order.notes || undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: order.paidAt || undefined,
      items: order.items.map((item) => ({
        id: item.id,
        packageId: item.packageId,
        packageName: item.packageName,
        packageDuration: item.packageDuration,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        appointmentId: item.appointmentId || undefined,
        hour: item.hour || undefined,
        details: item.details || undefined,
      })),
    }));
  }

  /**
   * Mark order as paid
   */
  async markOrderAsPaid(
    orderId: string,
    paymentDetails: {
      paymentMethod?: string;
      transactionId?: string;
      userId?: string; // Optional: for validation
    },
  ): Promise<OrderResponseDto> {
    // Get the order
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        currency: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate user if provided
    if (paymentDetails.userId && order.userId !== paymentDetails.userId) {
      throw new BadRequestException(
        'Order does not belong to the specified user',
      );
    }

    // Check if order is already paid
    if (order.status === 'PAID') {
      throw new BadRequestException('Order is already paid');
    }

    // Check if order is in a valid state for payment
    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Order cannot be paid in current status: ${order.status}`,
      );
    }

    // Update order status to PAID
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Return updated order
    return {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      userId: updatedOrder.userId,
      sellerId: updatedOrder.sellerId,
      seller: updatedOrder.seller,
      status: updatedOrder.status,
      subtotal: updatedOrder.subtotal,
      taxAmount: updatedOrder.taxAmount,
      currencyCode: updatedOrder.currencyCode,
      currency: order.currency,
      discountAmount: updatedOrder.discountAmount,
      totalAmount: updatedOrder.totalAmount,
      customerName: updatedOrder.customerName || undefined,
      customerEmail: updatedOrder.customerEmail || undefined,
      customerPhone: updatedOrder.customerPhone || undefined,
      notes: updatedOrder.notes || undefined,
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt,
      paidAt: updatedOrder.paidAt || undefined,
      items: updatedOrder.items.map((item) => ({
        id: item.id,
        packageId: item.packageId,
        packageName: item.packageName,
        packageDuration: item.packageDuration,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        appointmentId: item.appointmentId || undefined,
        hour: item.hour || undefined,
        details: item.details || undefined,
      })),
    };
  }
}
