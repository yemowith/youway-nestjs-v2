import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TRANSACTION_EVENTS } from 'src/events/transaction/transaction.events';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
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
    return await this.prisma.$transaction(async (tx) => {
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

      // Emit transaction created event
      await this.eventEmitter.emitAsync(TRANSACTION_EVENTS.CREATED, {
        transactionId: transaction.id,
        userId: transaction.userId,
        currencyCode: transaction.currencyCode,
        type: transaction.type,
        amount: transaction.amount.toNumber(),
        timestamp: new Date(),
      });

      return transaction;
    });
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
    return await this.prisma.$transaction(async (tx) => {
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

      // Emit transaction updated event
      await this.eventEmitter.emitAsync(TRANSACTION_EVENTS.UPDATED, {
        transactionId: transaction.id,
        userId: transaction.userId,
        currencyCode: transaction.currencyCode,
        type: transaction.type,
        amount: transaction.amount.toNumber(),
        timestamp: new Date(),
      });

      return transaction;
    });
  }

  async delete(id: string) {
    return await this.prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Transaction not found');
      }

      await tx.transaction.delete({
        where: { id },
      });

      // Emit transaction deleted event
      await this.eventEmitter.emitAsync(TRANSACTION_EVENTS.DELETED, {
        transactionId: id,
        userId: existing.userId,
        currencyCode: existing.currencyCode,
        timestamp: new Date(),
      });

      return { success: true };
    });
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
