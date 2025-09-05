import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { AccountingService } from 'src/modules/accounting/accounting.service';
import { LocationService } from 'src/modules/user/location/location.service';
import { UserPaymentsResponseDto } from './dto/user-payments.dto';

@Injectable()
export class FinancialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountingService: AccountingService,
    private readonly locationService: LocationService,
  ) {}

  async getFinancialSummary(userId: string) {
    const location = await this.locationService.getLocation(userId);
    const currencyCode = location.country?.currency?.code || 'TRY';
    const balance = await this.accountingService.getUserBalance(
      userId,
      currencyCode,
    );

    const lastTransactions = await this.accountingService.getLastTransactions(
      userId,
      currencyCode,
    );

    /* todo */
    const lastMonthRevenue = 0;
    const lastMonthPayments = 0;
    const lastMonthWithdrawals = 0;
    const lastMonthDeposits = 0;
    const lastMonthCommissions = 0;

    // Transform transactions to match DTO structure
    const transformedTransactions = lastTransactions.map((transaction) => ({
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount.toNumber(),
      balance: transaction.balance.toNumber(),
      type: transaction.type,
      referenceId: transaction.referenceId,
      referenceType: transaction.referenceType,
      description: transaction.description,
      currencyCode: transaction.currencyCode,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    }));

    const financialSummary = {
      balance,
      currencyCode,
      lastMonthRevenue,
      lastMonthPayments,
      lastMonthWithdrawals,
      lastMonthDeposits,
      lastMonthCommissions,
      lastTransactions: transformedTransactions,
    };

    return financialSummary;
  }

  async getPayments(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<UserPaymentsResponseDto> {
    const location = await this.locationService.getLocation(userId);
    const currencyCode = location.country?.currency?.code || 'TRY';

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get total count of payments
    const totalCount = await this.prisma.payment.count({
      where: {
        order: {
          userId,
        },
        currencyCode,
      },
    });

    // Get paginated payments with related data
    const payments = await this.prisma.payment.findMany({
      where: {
        order: {
          userId,
        },
        currencyCode,
      },
      include: {
        paymentMethod: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // Transform payments to match DTO structure
    const transformedPayments = payments.map((payment) => ({
      id: payment.id,
      paymentMethodId: payment.paymentMethodId,
      paymentMethod: {
        id: payment.paymentMethod.id,
        name: payment.paymentMethod.name,
        icon: payment.paymentMethod.icon,
        color: payment.paymentMethod.color,
        providerKey: payment.paymentMethod.providerKey,
        description: payment.paymentMethod.description,
      },
      orderId: payment.orderId,
      orderNumber: payment.orderNumber,
      amount: payment.amount.toNumber(),
      status: payment.status,
      transactionId: payment.transactionId,
      description: payment.description,
      currencyCode: payment.currencyCode,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      payments: transformedPayments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }
}
