import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class NotifyUserService {
  constructor(
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
  ) {}

  async notifyUser(
    identities: { provider: string; providerId: string }[],
    subject: string,
    message: { mail: string; sms: string },
  ) {
    await Promise.all(
      identities.map(async (identity) => {
        if (identity.provider === 'EMAIL') {
          await this.mailService.sendNotification(
            identity.providerId,
            subject,
            message.mail,
          );
        } else if (identity.provider === 'PHONE') {
          await this.smsService.sendNotification(
            identity.providerId,
            message.sms,
          );
        }
      }),
    );
  }
}
