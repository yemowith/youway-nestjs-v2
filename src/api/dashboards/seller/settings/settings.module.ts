import { Module } from '@nestjs/common';
import { SellerAvailabilityModule } from './seller-availability/seller-availability.module';
import { SellerPackagesModule } from './seller-packages/seller-packages.module';

@Module({
  imports: [SellerAvailabilityModule, SellerPackagesModule]
})
export class SettingsModule {}
