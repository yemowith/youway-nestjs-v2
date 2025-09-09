import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import {
  TransactionCreatedEvent,
  TransactionUpdatedEvent,
  TransactionDeletedEvent,
  TRANSACTION_EVENTS,
} from './transaction.events';
import { AccountingService } from 'src/modules/accounting/accounting.service';

@Injectable()
export class TransactionEventsListener {
  private readonly logger = new Logger(TransactionEventsListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly accountingService: AccountingService,
  ) {}

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
      await this.accountingService.recalculateUserBalances(userId);
    } catch (error) {
      this.logger.error(
        `Failed to update balance for user ${userId} (${currencyCode}): ${error.message}`,
      );
    }
  }
}
