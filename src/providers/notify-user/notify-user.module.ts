import { Module } from '@nestjs/common';
import { NotifyUserController } from './notify-user.controller';
import { NotifyUserService } from './notify-user.service';
import { SmsModule } from '../sms/sms.module';
import { MailModule } from '../mail/mail.module';

@Module({
  controllers: [NotifyUserController],
  providers: [NotifyUserService],
  imports: [MailModule, SmsModule],
  exports: [NotifyUserService],
})
export class NotifyUserModule {}
