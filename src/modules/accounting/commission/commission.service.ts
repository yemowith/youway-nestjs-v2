import { Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { TransactionService } from '../transaction.service';
import { PaymentStatus, TransactionType } from '@prisma/client';

@Injectable()
export class CommissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async createCommission(appointmentId: string) {
    console.log('Creating commission for appointment', appointmentId);
    // Fetch appointment with package and check for existing commission in one query
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        package: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (!appointment.package) {
      throw new NotFoundException('Package not found');
    }

    // Check if payment is completed
    const payment = await this.prisma.payment.findFirst({
      where: {
        order: {
          items: { some: { appointmentId } },
        },
        status: PaymentStatus.COMPLETED,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not completed for this appointment');
    }

    // Check if commission should be created
    if (
      appointment.package.commission === null ||
      appointment.package.commission === new Decimal(0)
    ) {
      console.log('Commission should not be created');
      return;
    }

    // Check if commission already exists
    const existingCommission = await this.prisma.commission.findUnique({
      where: {
        userId_appointmentId: {
          userId: appointment.sellerId,
          appointmentId,
        },
      },
    });

    if (existingCommission) {
      console.log('Commission already exists');
      return; // Commission already exists
    }

    // Get seller package
    const sellerPackage = await this.prisma.sellerPackage.findUnique({
      where: {
        sellerId_packageId: {
          sellerId: appointment.sellerId,
          packageId: appointment.packageId,
        },
      },
    });

    if (!sellerPackage) {
      throw new NotFoundException('Seller package not found');
    }

    // Calculate commission
    const commissionPercent = appointment.package.commission.toNumber();
    const packagePrice = sellerPackage.price.toNumber();
    const commissionAmount = (packagePrice * commissionPercent) / 100;

    console.log('Commission amount', commissionAmount);
    console.log('Commission percent', commissionPercent);
    console.log('Package price', packagePrice);

    if (commissionAmount === 0) {
      console.log('Commission amount is 0');
      return;
    }

    try {
      const commission = await this.prisma.commission.create({
        data: {
          userId: appointment.sellerId,
          appointmentId,
          percent: commissionPercent,
          amount: commissionAmount,
          currencyCode: sellerPackage.currencyCode,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    // Create transaction record
    await this.transactionService.create({
      userId: appointment.sellerId,
      currencyCode: sellerPackage.currencyCode,
      type: TransactionType.IN,
      amount: commissionAmount,
    });
  }

  async getCommissionStatistics(
    sellerId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ) {
    const whereClause: any = { userId: sellerId };

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        whereClause.createdAt.lte = dateTo;
      }
    }

    const [totalCommissions, totalSessions] = await Promise.all([
      // Total commission amount
      this.prisma.commission.aggregate({
        where: whereClause,
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      }),

      // Total sessions (appointments with commissions)
      this.prisma.commission
        .findMany({
          where: whereClause,
          select: { appointmentId: true },
          distinct: ['appointmentId'],
        })
        .then((results) => results.length),
    ]);

    const totalAmount = totalCommissions._sum.amount || 0;
    const sessionCount = totalSessions;
    const averagePerSession =
      sessionCount > 0 ? Number(totalAmount) / sessionCount : 0;

    return {
      totalAmount: Number(totalAmount),
      totalSessions: sessionCount,
      averagePerSession: Number(averagePerSession.toFixed(2)),
      commissionCount: totalCommissions._count.id || 0,
    };
  }
}
