import { Module } from '@nestjs/common'
import { ProfilesModule } from './profiles/profiles.module'
import { ConfigModule } from '@nestjs/config'
import { AvatarsModule } from './profiles/avatars/avatars.module'
import { ProfilesController } from './profiles/profiles.controller'
import { ProfilesService } from './profiles/profiles.service'
import { TCVerifyService } from './profiles/tc-verify.service'
import { ReferralModule } from './referral/referral.module'
import { NotificationsModule } from './notifications/notifications.module'
import { JwtService } from '@nestjs/jwt'
import { HomeModule } from './home/home.module'
import { AppointmentsModule } from './appointments/appointments.module';
import { SellersModule } from './sellers/sellers.module';
import { FinancialModule } from './financial/financial.module';

@Module({
  imports: [
    ProfilesModule,
    ConfigModule,
    AvatarsModule,
    ReferralModule,
    NotificationsModule,
    HomeModule,
    AppointmentsModule,
    SellersModule,
    FinancialModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService, TCVerifyService, JwtService],
  exports: [ProfilesModule, NotificationsModule, AvatarsModule],
})
export class UserModule {}
