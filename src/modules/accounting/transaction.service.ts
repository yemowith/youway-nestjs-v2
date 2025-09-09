import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TRANSACTION_EVENTS } from 'src/events/transaction/transaction.events';
import { AccountingService } from './accounting.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly accountingService: AccountingService,
  ) {}

  async create(data: {
    userId: string;
    currencyCode?: string;
    type: 'IN' | 'OUT';
    amount: number;
    referenceId?: string;
    referenceType?: string;
    description?: string;
  }) {
    const transaction = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: data.userId,
          currencyCode: data.currencyCode,
          type: data.type,
          amount: data.amount,
          referenceId: data.referenceId,
          referenceType: data.referenceType,
          description: data.description,
        },
      });
      return transaction;
    });
    await this.accountingService.recalculateUserBalances(data.userId);
    return transaction;
  }

  async update(
    id: string,
    data: {
      type?: 'IN' | 'OUT';
      amount?: number;
      referenceId?: string;
      referenceType?: string;
      description?: string;
    },
  ) {
    const transaction = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Transaction not found');
      }

      const transaction = await tx.transaction.update({
        where: { id },
        data,
      });

      return transaction;
    });

    await this.accountingService.recalculateUserBalances(transaction.userId);
    return transaction;
  }

  async delete(id: string) {
    const transaction = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Transaction not found');
      }

      await tx.transaction.delete({
        where: { id },
      });

      return existing;
    });

    await this.accountingService.recalculateUserBalances(transaction.userId);
  }

  async findMany(userId: string, currencyCode?: string) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        ...(currencyCode && { currencyCode }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        currency: {
          select: {
            code: true,
            name: true,
            symbol: true,
            isoCode: true,
            leftCode: true,
            rightCode: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        currency: {
          select: {
            code: true,
            name: true,
            symbol: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }
}
