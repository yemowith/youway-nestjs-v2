import { Module } from '@nestjs/common'
import { SellerController } from './seller.controller'
import { SellerService } from './seller.service'
import { AvatarsService } from 'src/modules/user/avatar/avatars.service'
import { ReferralService } from 'src/modules/user/referral/referral.service'
import { UserModule } from 'src/modules/user/user.module'

@Module({
  controllers: [SellerController],
  providers: [SellerService, AvatarsService, ReferralService],
  imports: [UserModule],
})
export class SellerModule {}
