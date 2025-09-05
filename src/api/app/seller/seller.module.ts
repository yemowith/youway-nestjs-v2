import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { RatingModule } from './rating/rating.module';
import { AvatarsModule } from 'src/api/dashboards/user/profiles/avatars/avatars.module';
import { PackagesModule } from 'src/modules/seller/packages/packages.module';

@Module({
  providers: [SellerService],
  controllers: [SellerController],
  imports: [RatingModule, AvatarsModule, PackagesModule],
})
export class SellerModule {}
