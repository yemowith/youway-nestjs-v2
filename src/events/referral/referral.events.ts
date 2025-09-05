export interface NewReferralRegisteredEvent {
  userId: string;
  sponsorId: string;
  referralCode: string;
  timestamp: Date;
}

export const REFERRAL_EVENTS = {
  REGISTERED: 'referral.registered',
} as const;
