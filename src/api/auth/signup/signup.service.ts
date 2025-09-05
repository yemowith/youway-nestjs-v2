import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailRegisterDto } from './dto/email-register.dto';
import { PhoneRegisterDto } from './dto/phone-register.dto';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

import { AuthService } from '../auth.service';
import { OtpService } from '../otp/otp.service';
import { ReferralService } from 'src/modules/user/referral/referral.service';
import { User } from '@prisma/client';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class SignUpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly configService: ConfigService,
    private readonly referralService: ReferralService,
    private readonly userService: UserService,
  ) {}

  private async _checkReferralCode(referralCode: string) {
    // Validate referral code if provided
    if (referralCode) {
      const isValidCode = await this.referralService.isCodeExists(referralCode);
      if (!isValidCode) {
        throw new NotFoundException('Invalid referral code');
      }
    }
  }

  private async _beforeRegister(
    registerDto: PhoneRegisterDto | EmailRegisterDto,
  ) {
    const { firstName, lastName, password, metadata } = registerDto;

    return { firstName, lastName, password, metadata };
  }

  private async _afterRegister(
    registerDto: PhoneRegisterDto | EmailRegisterDto,
    user: User,
  ) {
    await this.userService.onRegister(user.id, {
      referralCode: registerDto.referralCode,
      country: {
        countryCode: registerDto.countryCode,
      },
    });
  }

  async phoneRegister(req: Request, phoneRegisterDto: PhoneRegisterDto) {
    const { phone, firstName, lastName, password, metadata } = phoneRegisterDto;

    await this._beforeRegister(phoneRegisterDto);

    if (metadata && metadata.referralCode) {
      await this._checkReferralCode(metadata.referralCode);
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      const existingIdentity = await prisma.identity.findUnique({
        where: {
          provider_providerId: { provider: 'PHONE', providerId: phone },
        },
        include: {
          user: true,
        },
      });

      if (existingIdentity) {
        if (existingIdentity.user.status === 'PENDING') {
          await prisma.user.delete({
            where: { id: existingIdentity.userId },
          });
        } else {
          const messageFn = this.configService.getOrThrow<
            (provider: string) => string
          >('messages.auth.userExists');
          throw new BadRequestException(messageFn('phone number'));
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          metadata,
          password: hashedPassword,
          identities: {
            create: {
              provider: 'PHONE',
              providerId: phone,
            },
          },
        },
      });

      return user;
    });

    // OTP and referral logic after transaction
    await this.otpService.sendOtp({
      target: phone,
      type: 'PHONE_VERIFICATION',
    });

    await this._afterRegister(phoneRegisterDto, result);

    const messageFn = this.configService.getOrThrow<
      (provider: string) => string
    >('messages.registration.initiated');
    return {
      message: messageFn('phone'),
    };
  }

  async emailRegister(req: Request, emailRegisterDto: EmailRegisterDto) {
    const { email, password, firstName, lastName, metadata } = emailRegisterDto;

    await this._beforeRegister(emailRegisterDto);

    if (metadata && metadata.referralCode) {
      await this._checkReferralCode(metadata.referralCode);
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      const existingIdentity = await prisma.identity.findUnique({
        where: {
          provider_providerId: { provider: 'EMAIL', providerId: email },
        },
        include: {
          user: true,
        },
      });

      if (existingIdentity) {
        if (existingIdentity.user.status === 'PENDING') {
          await prisma.user.delete({
            where: { id: existingIdentity.userId },
          });
        } else {
          const messageFn = this.configService.getOrThrow<
            (provider: string) => string
          >('messages.auth.userExists');
          throw new BadRequestException(messageFn('email'));
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          metadata,
          password: hashedPassword,
          identities: {
            create: {
              provider: 'EMAIL',
              providerId: email,
            },
          },
        },
        include: {
          identities: true,
        },
      });

      return user;
    });

    // OTP and referral logic after transaction
    await this.otpService.sendOtp({
      target: email,
      type: 'EMAIL_VERIFICATION',
    });

    await this._afterRegister(emailRegisterDto, result);

    const messageFn = this.configService.getOrThrow<
      (provider: string) => string
    >('messages.registration.initiated');
    return {
      message: messageFn('email'),
    };
  }
}
