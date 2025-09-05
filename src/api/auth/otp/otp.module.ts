import { Module, forwardRef } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { AuthModule } from '../auth.module';
import { MailModule } from 'src/providers/mail/mail.module';
import { SmsModule } from 'src/providers/sms/sms.module';
import { ReferralModule } from 'src/api/dashboards/user/referral/referral.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MailModule,
    SmsModule,
    ReferralModule,
  ],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
