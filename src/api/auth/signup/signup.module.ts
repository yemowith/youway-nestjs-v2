import { Module, forwardRef } from '@nestjs/common';
import { SignUpController } from './signup.controller';
import { SignUpService } from './signup.service';
import { AuthModule } from '../auth.module';
import { PrismaModule } from 'src/clients/prisma/prisma.module';
import { OtpModule } from '../otp/otp.module';
import { ReferralModule } from 'src/api/dashboards/user/referral/referral.module';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    PrismaModule,
    forwardRef(() => OtpModule),
    ReferralModule,
    UserModule,
  ],
  controllers: [SignUpController],
  providers: [SignUpService],
  exports: [SignUpService],
})
export class SignupModule {}
