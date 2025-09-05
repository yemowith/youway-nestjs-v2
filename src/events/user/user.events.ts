import { AuthProvider } from '@prisma/client';

export interface NewUserRegisteredEvent {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
  timestamp: Date;
}

export const USER_EVENTS = {
  REGISTERED: 'user.registered',
  PASSWORD_SET: 'user.password_set',
} as const;

export interface NewSellerCreatedEvent {
  userId: string;
  identities: { provider: AuthProvider; providerId: string }[];
  firstName: string;
  lastName: string;
  password: string;
  timestamp: Date;
}

export const SELLER_EVENTS = {
  CREATED: 'seller.created',
} as const;

export interface PasswordSetEvent {
  userId: string;
  identities: { provider: AuthProvider; providerId: string }[];
  firstName: string;
  lastName: string;
  password: string;
  timestamp: Date;
}
