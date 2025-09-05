import { Module, forwardRef } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaModule } from 'src/clients/prisma/prisma.module'
import { JwtStrategy } from './strategies/jwt.strategy'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'
import { MailModule } from 'src/providers/mail/mail.module'
import { SignupModule } from './signup/signup.module'
import { SigninModule } from './signin/signin.module'
import { OtpModule } from './otp/otp.module'
import { RecovryModule } from './recovry/recovry.module'
import { SettingsModule } from './settings/settings.module'
import { ProfilesModule } from '../dashboards/user/profiles/profiles.module'

@Module({
  imports: [
    PrismaModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.accessTokenExpirationTime'),
        },
      }),
    }),
    forwardRef(() => SignupModule),
    forwardRef(() => SigninModule),
    forwardRef(() => OtpModule),
    RecovryModule,
    SettingsModule,
    ProfilesModule,
  ],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
