import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class TransactionDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Transaction amount' })
  amount: number;

  @ApiProperty({ description: 'Transaction balance' })
  balance: number;

  @ApiProperty({
    description: 'Transaction type (IN/OUT)',
    enum: TransactionType,
  })
  type: TransactionType;

  @ApiProperty({ description: 'Reference ID', required: false })
  referenceId: string | null;

  @ApiProperty({ description: 'Reference type', required: false })
  referenceType: string | null;

  @ApiProperty({ description: 'Transaction description', required: false })
  description: string | null;

  @ApiProperty({ description: 'Currency code' })
  currencyCode: string;

  @ApiProperty({ description: 'Transaction creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Transaction update date' })
  updatedAt: Date;
}

export class FinancialSummaryDto {
  @ApiProperty({ description: 'Current balance' })
  balance: number;

  @ApiProperty({ description: 'Currency code' })
  currencyCode: string;

  @ApiProperty({ description: 'Last month revenue' })
  lastMonthRevenue: number;

  @ApiProperty({ description: 'Last month payments' })
  lastMonthPayments: number;

  @ApiProperty({ description: 'Last month withdrawals' })
  lastMonthWithdrawals: number;

  @ApiProperty({ description: 'Last month deposits' })
  lastMonthDeposits: number;

  @ApiProperty({ description: 'Last month commissions' })
  lastMonthCommissions: number;

  @ApiProperty({
    description: 'Last transactions',
    type: [TransactionDto],
  })
  lastTransactions: TransactionDto[];
}
