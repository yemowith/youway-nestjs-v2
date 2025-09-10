import { Module } from '@nestjs/common';
import { ProcessAppointmentsService } from './process-appointments.service';
import { DatetimeModule } from 'src/helpers/datetime/datetime.module';
import { NotifyUserModule } from 'src/providers/notify-user/notify-user.module';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [DatetimeModule, NotifyUserModule, UserModule],
  providers: [ProcessAppointmentsService],
  exports: [ProcessAppointmentsService],
})
export class ProcessAppointmentsModule {}
