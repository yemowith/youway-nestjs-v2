import { Module } from '@nestjs/common'
import { ReferralService } from './referral.service'
import { AvatarModule } from '../avatar/avatar.module'

@Module({
  imports: [AvatarModule],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}
