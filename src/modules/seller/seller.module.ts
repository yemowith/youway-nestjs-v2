import { Module } from '@nestjs/common';
import { AvailabilityModule } from './availability/availability.module';
import { AppointmentModule } from './appointment/appointment.module';
import { PackagesModule } from './packages/packages.module';

@Module({
  imports: [AvailabilityModule, AppointmentModule, PackagesModule],
  exports: [AvailabilityModule],
})
export class SellerModule {}
