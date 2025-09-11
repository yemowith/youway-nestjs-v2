import { Module } from '@nestjs/common';
import { AvailabilityModule } from './availability/availability.module';
import { AppointmentModule } from './appointment/appointment.module';
import { PackagesModule } from './packages/packages.module';
import { ProfileImagesModule } from './profile-images/profile-images.module';

@Module({
  imports: [AvailabilityModule, AppointmentModule, PackagesModule, ProfileImagesModule],
  exports: [AvailabilityModule],
})
export class SellerModule {}
