import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { CreatePaymentForOrderDto, PaymentResponseDto } from './dto';
import {
  AppointmentStatus,
  Order,
  OrderStatus,
  PaymentStatus,
} from '@prisma/client';
import { PayTrService } from 'src/modules/payment-methods/pay-tr/pay-tr.service';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppointmentService } from 'src/modules/seller/appointment/appointment.service';
import { CommissionService } from 'src/modules/accounting/commission/commission.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paytr: PayTrService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly appointmentService: AppointmentService,
    private readonly commissionService: CommissionService,
  ) {}

  private async validateOrder(order: Order): Promise<boolean> {
    const items = await this.prisma.orderItem.findMany({
      where: { orderId: order.id },
    });
    if (items.length === 0) {
      throw new BadRequestException('Order has no items');
    }

    for (const item of items) {
      if (item.appointmentId) {
        await this.appointmentService.checkSlotAvailability({
          sellerId: order.sellerId,
          packageId: item.packageId,
          hour: item.hour!,
          dateStr: item.dateStr!,
        });
      }
    }

    return true;
  }

  async createPaymentForOrder(
    orderId: string,
    dto: CreatePaymentForOrderDto,
    userId: string,
  ): Promise<PaymentResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        currency: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.userId !== userId) {
      throw new BadRequestException('Order does not belong to current user');
    }

    const amount = dto.amount ?? Number(order.totalAmount);
    const currencyCode = dto.currencyCode ?? order.currencyCode;

    // If amount is zero (free order), automatically complete the payment
    if (amount === 0) {
      const paymentMethod = await this.prisma.paymentMethod.findFirst({
        where: { providerKey: 'wallet-balance' },
      });

      if (!paymentMethod)
        throw new BadRequestException('Payment method not found');

      await this.prisma.payment.deleteMany({
        where: { orderId: order.id },
      });

      // Create a completed payment record for free orders
      const payment = await this.prisma.payment.create({
        data: {
          paymentMethodId: paymentMethod.id, // Use a special identifier for free orders
          currencyCode,
          orderId: order.id,
          orderNumber: order.orderNumber,
          amount: 0,
          description: dto.description || 'Free order - no payment required',
          paidAt: new Date(),
        },
      });

      // Automatically process the success payment
      await this.successPayment(orderId);

      return this.mapPayment(payment);
    }

    // For paid orders, validate payment method
    let paymentMethod = null as null | { id: string; providerKey: string };
    if (!dto.paymentMethodId && !dto.providerKey) {
      throw new BadRequestException(
        'Either paymentMethodId or providerKey is required',
      );
    }

    if (dto.paymentMethodId) {
      paymentMethod = await this.prisma.paymentMethod.findUnique({
        where: { id: dto.paymentMethodId },
        select: { id: true, providerKey: true, isActive: true },
      });
      if (!paymentMethod)
        throw new BadRequestException('Payment method not found');
      const isActive = await this.prisma.paymentMethod.findUnique({
        where: { id: dto.paymentMethodId },
        select: { isActive: true },
      });
      if (!isActive?.isActive)
        throw new BadRequestException('Payment method is not active');
    } else if (dto.providerKey) {
      const method = await this.prisma.paymentMethod.findFirst({
        where: { providerKey: dto.providerKey, isActive: true },
        select: { id: true, providerKey: true },
      });
      if (!method)
        throw new BadRequestException('Payment method not found or inactive');
      paymentMethod = method;
    }

    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    await this.prisma.payment.deleteMany({
      where: { orderId: order.id },
    });

    const payment = await this.prisma.payment.create({
      data: {
        paymentMethodId: paymentMethod!.id,
        currencyCode,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount,
        status: PaymentStatus.PENDING,
        description: dto.description,
      },
    });

    return this.mapPayment(payment);
  }

  async getPaymentById(
    paymentId: string,
    userId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true, paymentMethod: true, currency: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.order && payment.order.userId !== userId) {
      throw new BadRequestException('Payment does not belong to current user');
    }
    return this.mapPayment(payment);
  }

  async processPayment(
    paymentId: string,
    userId: string,
    userIp: string,
  ): Promise<{ payment: PaymentResponseDto; providerPayload?: any }> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true, paymentMethod: true, currency: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (!payment.order)
      throw new BadRequestException('Payment is not linked to an order');
    if (payment.order.userId !== userId) {
      throw new BadRequestException('Payment does not belong to current user');
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be processed');
    }

    await this.validateOrder(payment.order);

    const providerKey = payment.paymentMethod.providerKey;

    if (providerKey === 'paytr') {
      const paymentId = payment.id;
      const baseUrl = `${this.configService.get(
        'app.siteUrl',
      )}/app/order/payment/${paymentId}`;

      const okUrl = `${baseUrl}/success`;
      const failUrl = `${baseUrl}/failed`;

      const token = await this.paytr.getOrderTokenIframe(
        payment.orderId!,
        userIp,
        okUrl,
        failUrl,
      );
      return {
        payment: this.mapPayment(payment),
        providerPayload: { type: 'paytr', token },
      };
    }

    if (providerKey === 'iban') {
      // Manual transfer; return instruction placeholder
      const settings = await this.prisma.paymentSetting.findMany({
        where: { paymentMethodId: payment.paymentMethodId },
        select: { key: true, value: true },
      });
      const instruction = settings.reduce(
        (acc, s) => ({ ...acc, [s.key]: s.value }),
        {} as Record<string, string>,
      );
      return {
        payment: this.mapPayment(payment),
        providerPayload: { type: 'iban', instruction },
      };
    }

    throw new BadRequestException(
      'Selected payment method is not supported for processing',
    );
  }

  private mapPayment(payment: any): PaymentResponseDto {
    return {
      id: payment.id,
      paymentMethodId: payment.paymentMethodId,
      currencyCode: payment.currencyCode,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      transactionId: payment.transactionId ?? undefined,
      description: payment.description ?? undefined,
      paidAt: payment.paidAt ?? undefined,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      currency: payment.currency,
    };
  }

  async successPayment(orderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      include: {
        order: {
          include: {
            items: {
              select: {
                appointmentId: true,
              },
            },
          },
        },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (!payment.order)
      throw new BadRequestException('Payment is not linked to an order');
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not pending');
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.COMPLETED },
        });

        await tx.order.update({
          where: { id: payment.orderId! },
          data: { status: OrderStatus.COMPLETED },
        });

        const items = await tx.orderItem.findMany({
          where: { orderId: payment.orderId! },
        });

        for (const item of items) {
          if (item.appointmentId) {
            await this.appointmentService.scheduleAppointment({
              appointmentId: item.appointmentId,
            });
          }
        }
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    for (const item of payment.order.items) {
      if (item.appointmentId) {
        await this.commissionService.createCommission(item.appointmentId);
      }
    }
  }

  async getOrderIdByNumber(orderNumber: string): Promise<string | null> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true },
    });
    return order?.id || null;
  }
}
