import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/clients/prisma/prisma.service';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  isoCode: string;
  leftCode?: string | null;
  rightCode?: string | null;
}

@Injectable()
export class AccountingService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrencies() {
    return this.prisma.currency.findMany({
      select: {
        code: true,
        name: true,
        symbol: true,
        isoCode: true,
        leftCode: true,
        rightCode: true,
      },
    });
  }

  async calculateBalance(userId: string, currencyCode: string) {
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

    return newBalance;
  }

  async getUserBalance(userId: string, currencyCode: string) {
    const balance = await this.prisma.balance.findFirst({
      where: { userId, currencyCode },
    });

    if (!balance) {
      const newBalance = await this.calculateBalance(userId, currencyCode);
      await this.prisma.balance.create({
        data: {
          userId,
          currencyCode,
          balance: newBalance,
        },
      });
      return newBalance;
    }

    return balance.balance.toNumber();
  }

  async getUserBalances(userId: string) {
    const currencies = await this.getCurrencies();
    const balances: Array<{
      currency: Currency;
      balance: number;
    }> = [];

    for (const currency of currencies) {
      const balanceData = await this.getUserBalance(userId, currency.code);
      balances.push({
        currency: currency,
        balance: balanceData,
      });
    }

    return balances;
  }

  async recalculateUserBalances(userId: string) {
    const currencies = await this.getCurrencies();

    for (const currency of currencies) {
      const newBalance = await this.calculateBalance(userId, currency.code);

      // Find existing balance record
      const existingBalance = await this.prisma.balance.findFirst({
        where: {
          userId,
          currencyCode: currency.code,
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
            currencyCode: currency.code,
            balance: newBalance,
          },
        });
      }
    }

    return this.getUserBalances(userId);
  }

  async getLastTransactions(
    userId: string,
    currencyCode: string,
    limit: number = 10,
  ) {
    return this.prisma.transaction.findMany({
      where: { userId, currencyCode },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
