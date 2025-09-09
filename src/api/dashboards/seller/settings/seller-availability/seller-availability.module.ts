import { Module } from '@nestjs/common';
import { SellerAvailabilityService } from './seller-availability.service';
import { SellerAvailabilityController } from './seller-availability.controller';
import { AppointmentModule } from 'src/modules/seller/appointment/appointment.module';
import { LocationModule } from 'src/modules/user/location/location.module';
import { DatetimeModule } from 'src/helpers/datetime/datetime.module';

@Module({
  providers: [SellerAvailabilityService],
  controllers: [SellerAvailabilityController],
  imports: [AppointmentModule, LocationModule, DatetimeModule],
})
export class SellerAvailabilityModule {}
