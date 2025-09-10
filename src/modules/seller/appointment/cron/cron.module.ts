import { forwardRef, Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { AppointmentModule } from '../appointment.module';
import { DatetimeModule } from 'src/helpers/datetime/datetime.module';
import { ProcessAppointmentsModule } from '../process-appointments/process-appointments.module';

@Module({
  imports: [
    forwardRef(() => AppointmentModule),
    DatetimeModule,
    ProcessAppointmentsModule,
  ],
  providers: [CronService],
})
export class CronModule {}
