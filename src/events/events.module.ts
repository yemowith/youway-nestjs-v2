import { Module } from '@nestjs/common';
import { UserEventsListener } from './user/user.events.listener';
import { ReferralEventsListener } from './referral/referral.events.listener';
import { TransactionEventsListener } from './transaction/transaction.events.listener';
import { AppointmentEventsListener } from './appointment/appointment.events.listener';
import { NotifyUserModule } from 'src/providers/notify-user/notify-user.module';
import { MailModule } from 'src/providers/mail/mail.module';
import { UserModule } from 'src/modules/user/user.module';
import { PrismaModule } from 'src/clients/prisma/prisma.module';
import { AccountingModule } from 'src/modules/accounting/accounting.module';

@Module({
  imports: [
    NotifyUserModule,
    MailModule,
    UserModule,
    PrismaModule,
    AccountingModule,
  ],
  providers: [
    UserEventsListener,
    ReferralEventsListener,
    TransactionEventsListener,
    AppointmentEventsListener,
  ],
  exports: [],
})
export class EventsModule {}
