export interface TransactionCreatedEvent {
  transactionId: string;
  userId: string;
  currencyCode: string;
  type: 'IN' | 'OUT';
  amount: number;
  timestamp: Date;
}

export interface TransactionUpdatedEvent {
  transactionId: string;
  userId: string;
  currencyCode: string;
  type: 'IN' | 'OUT';
  amount: number;
  timestamp: Date;
}

export interface TransactionDeletedEvent {
  transactionId: string;
  userId: string;
  currencyCode: string;
  timestamp: Date;
}

export const TRANSACTION_EVENTS = {
  CREATED: 'transaction.created',
  UPDATED: 'transaction.updated',
  DELETED: 'transaction.deleted',
} as const;
