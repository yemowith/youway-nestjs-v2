import { forwardRef, Global, Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { LocationModule } from 'src/modules/user/location/location.module';
import { DatetimeModule } from 'src/helpers/datetime/datetime.module';
import { AppointmentSettingService } from './appointment-setting.service';
import { AvailabilityModule } from '../availability/availability.module';
import { EventsModule } from 'src/events/events.module';
import { PackagesModule } from '../packages/packages.module';
import { AvatarsModule } from 'src/api/dashboards/user/profiles/avatars/avatars.module';
import { CronModule } from './cron/cron.module';
import { ProcessAppointmentsModule } from './process-appointments/process-appointments.module';
import { ProfileImagesModule } from '../profile-images/profile-images.module';

@Global()
@Module({
  providers: [AppointmentService, AppointmentSettingService],
  exports: [AppointmentService, AppointmentSettingService],
  imports: [
    LocationModule,
    DatetimeModule,
    forwardRef(() => AvailabilityModule),
    EventsModule,
    PackagesModule,
    AvatarsModule,
    CronModule,
    ProcessAppointmentsModule,
    ProfileImagesModule,
  ],
})
export class AppointmentModule {}
