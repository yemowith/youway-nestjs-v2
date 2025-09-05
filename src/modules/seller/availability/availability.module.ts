import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { LocationModule } from 'src/modules/user/location/location.module';
import { DatetimeModule } from 'src/helpers/datetime/datetime.module';
import { AvailabilitySetupService } from './availability-setup.service';

@Module({
  providers: [AvailabilityService, AvailabilitySetupService],
  exports: [AvailabilityService, AvailabilitySetupService],
  imports: [LocationModule, DatetimeModule],
})
export class AvailabilityModule {}
