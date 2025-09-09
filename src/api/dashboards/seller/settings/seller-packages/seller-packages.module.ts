import { Module } from '@nestjs/common';
import { SellerPackagesService } from './seller-packages.service';
import { SellerPackagesController } from './seller-packages.controller';
import { LocationModule } from 'src/modules/user/location/location.module';

@Module({
  providers: [SellerPackagesService],
  controllers: [SellerPackagesController],
  imports: [LocationModule],
})
export class SellerPackagesModule {}
