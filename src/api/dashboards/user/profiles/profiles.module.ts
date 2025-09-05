import { Module, forwardRef } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { AvatarsModule } from './avatars/avatars.module';
import { TCVerifyService } from './tc-verify.service';
import { ReferralModule } from '../referral/referral.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { JwtService } from '@nestjs/jwt';
import { AvatarModule } from 'src/modules/user/avatar/avatar.module';
import { UserModule } from 'src/modules/user/user.module';
import { LocationModule } from 'src/modules/user/location/location.module';
import { LocationService } from 'src/modules/user/location/location.service';

@Module({
  imports: [
    UserModule,
    AvatarsModule,
    ReferralModule,
    NotificationsModule,
    AvatarModule,
    LocationModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService, TCVerifyService, JwtService, LocationService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
