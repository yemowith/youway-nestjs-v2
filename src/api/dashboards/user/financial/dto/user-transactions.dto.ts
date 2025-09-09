import { ApiProperty } from '@nestjs/swagger';

export class TransactionDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Transaction amount' })
  amount: number;

  @ApiProperty({ description: 'Balance after transaction' })
  balance: number;

  @ApiProperty({ description: 'Transaction type', enum: ['IN', 'OUT'] })
  type: 'IN' | 'OUT';

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

export class UserTransactionsResponseDto {
  @ApiProperty({ description: 'List of transactions', type: [TransactionDto] })
  transactions: TransactionDto[];

  @ApiProperty({ description: 'Pagination information', type: Object })
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
