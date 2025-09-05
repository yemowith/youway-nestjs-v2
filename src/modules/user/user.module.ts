import { Module, forwardRef } from '@nestjs/common';
import { ReferralModule } from './referral/referral.module';
import { AvatarModule } from './avatar/avatar.module';
import { UserService } from './user.service';
import { LocationModule } from './location/location.module';
import { AvailabilityModule } from '../seller/availability/availability.module';
import { PackagesModule } from '../seller/packages/packages.module';

@Module({
  imports: [
    ReferralModule,
    AvatarModule,
    LocationModule,
    forwardRef(() => AvailabilityModule),
    forwardRef(() => PackagesModule),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
