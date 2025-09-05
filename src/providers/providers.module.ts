import { Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { SmsModule } from './sms/sms.module';
import { NotifyUserModule } from './notify-user/notify-user.module';

@Module({
  imports: [MailModule, SmsModule, NotifyUserModule],
  exports: [MailModule, SmsModule],
})
export class ProvidersModule {}
