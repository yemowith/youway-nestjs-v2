import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NewReferralRegisteredEvent, REFERRAL_EVENTS } from './referral.events';

@Injectable()
export class ReferralEventsListener {
  private readonly logger = new Logger(ReferralEventsListener.name);

  @OnEvent(REFERRAL_EVENTS.REGISTERED)
  async handleReferralRegisteredEvent(payload: NewReferralRegisteredEvent) {
    this.logger.log(
      `New referral registered: User ${payload.userId} referred by ${payload.sponsorId}`,
    );
  }
}
