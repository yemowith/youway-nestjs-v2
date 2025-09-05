import { Module } from '@nestjs/common'
import { ReferralController } from './referral.controller'
import { ReferralService } from 'src/modules/user/referral/referral.service'
import { AvatarsService } from '../../../../modules/user/avatar/avatars.service'
import { JwtService } from '@nestjs/jwt'

@Module({
  controllers: [ReferralController],
  providers: [ReferralService, AvatarsService, JwtService],
  exports: [ReferralService],
})
export class ReferralModule {}
