import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { PrismaModule } from '../../../clients/prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from '../otp/otp.service';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [PrismaModule, OtpModule],
  controllers: [SettingsController],
  providers: [SettingsService, JwtService],
  exports: [SettingsService],
})
export class SettingsModule {}
