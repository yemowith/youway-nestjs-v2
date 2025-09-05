import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

import { AvatarsModule } from '../profiles/avatars/avatars.module';
import { RatingModule } from 'src/api/app/seller/rating/rating.module';
import { ReferralModule } from '../referral/referral.module';
import { PackagesModule } from 'src/modules/seller/packages/packages.module';

@Module({
  controllers: [HomeController],
  providers: [HomeService],
  imports: [AvatarsModule, RatingModule, ReferralModule, PackagesModule],
})
export class HomeModule {}
