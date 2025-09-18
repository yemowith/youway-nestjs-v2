import { Module } from '@nestjs/common';
import { HelpController } from './help.controller';
import { HelpService } from './help.service';
import { MailService } from '../../../providers/mail/mail.service';

@Module({
  controllers: [HelpController],
  providers: [HelpService, MailService],
})
export class HelpModule {}
