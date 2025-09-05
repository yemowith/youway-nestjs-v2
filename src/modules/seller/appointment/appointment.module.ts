import { forwardRef, Global, Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { LocationModule } from 'src/modules/user/location/location.module';
import { DatetimeModule } from 'src/helpers/datetime/datetime.module';
import { AppointmentSettingService } from './appointment-setting.service';
import { AvailabilityModule } from '../availability/availability.module';
import { EventsModule } from 'src/events/events.module';
import { PackagesModule } from '../packages/packages.module';
import { AvatarsModule } from 'src/api/dashboards/user/profiles/avatars/avatars.module';

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
  ],
})
export class AppointmentModule {}
