import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import {
  TransactionCreatedEvent,
  TransactionUpdatedEvent,
  TransactionDeletedEvent,
  TRANSACTION_EVENTS,
} from './transaction.events';

@Injectable()
export class TransactionEventsListener {
  private readonly logger = new Logger(TransactionEventsListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent(TRANSACTION_EVENTS.CREATED)
  async handleTransactionCreatedEvent(payload: TransactionCreatedEvent) {
    this.logger.log(
      `Transaction created: ${payload.transactionId} for user ${payload.userId} (${payload.type} ${payload.amount} ${payload.currencyCode})`,
    );

    await this.updateBalance(payload.userId, payload.currencyCode);
  }

  @OnEvent(TRANSACTION_EVENTS.UPDATED)
  async handleTransactionUpdatedEvent(payload: TransactionUpdatedEvent) {
    this.logger.log(
      `Transaction updated: ${payload.transactionId} for user ${payload.userId} (${payload.type} ${payload.amount} ${payload.currencyCode})`,
    );

    await this.updateBalance(payload.userId, payload.currencyCode);
  }

  @OnEvent(TRANSACTION_EVENTS.DELETED)
  async handleTransactionDeletedEvent(payload: TransactionDeletedEvent) {
    this.logger.log(
      `Transaction deleted: ${payload.transactionId} for user ${payload.userId} (${payload.currencyCode})`,
    );

    await this.updateBalance(payload.userId, payload.currencyCode);
  }

  private async updateBalance(userId: string, currencyCode: string) {
    try {
      // Calculate new balance using SQL aggregation
      const result = await this.prisma.$queryRaw<Array<{ balance: number }>>`
        SELECT 
          COALESCE(
            SUM(
              CASE 
                WHEN type = 'IN' THEN amount 
                WHEN type = 'OUT' THEN -amount 
                ELSE 0 
              END
            ), 0
          ) as balance
        FROM "Transaction" 
        WHERE "userId" = ${userId}::uuid 
          AND "currencyCode" = ${currencyCode}
      `;

      const newBalance = result[0].balance;

      // Find existing balance record
      const existingBalance = await this.prisma.balance.findFirst({
        where: {
          userId,
          currencyCode,
        },
      });

      if (existingBalance) {
        // Update existing balance
        await this.prisma.balance.update({
          where: { id: existingBalance.id },
          data: {
            balance: newBalance,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new balance record
        await this.prisma.balance.create({
          data: {
            userId,
            currencyCode,
            balance: newBalance,
          },
        });
      }

      this.logger.log(
        `Balance updated for user ${userId} (${currencyCode}): ${newBalance}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update balance for user ${userId} (${currencyCode}): ${error.message}`,
      );
    }
  }
}
