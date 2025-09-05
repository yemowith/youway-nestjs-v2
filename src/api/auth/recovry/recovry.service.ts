import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { OtpService } from '../otp/otp.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class RecovryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly configService: ConfigService,
  ) {}

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { target } = forgotPasswordDto;

    // Check if user exists with this email or phone
    const identity = await this.prisma.identity.findFirst({
      where: {
        OR: [
          { providerId: target, provider: 'EMAIL' },
          { providerId: target, provider: 'PHONE' },
        ],
      },
      include: {
        user: true,
      },
    });

    if (!identity) {
      const messageFn = this.configService.getOrThrow<
        (provider: string) => string
      >('messages.auth.userNotFound');
      throw new NotFoundException(messageFn('email or phone number'));
    }

    if (identity.user.status !== 'ACTIVE') {
      throw new BadRequestException('Account is not active');
    }

    // Send OTP for password reset
    await this.otpService.sendOtp({
      target,
      type: 'PASSWORD_RESET',
    });

    const messageFn = this.configService.getOrThrow<(target: string) => string>(
      'messages.otp.sent',
    );
    return {
      message: messageFn(target),
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { target, code, newPassword } = resetPasswordDto;

    // Verify OTP
    const otp = await this.prisma.otp.findFirst({
      where: {
        target,
        code,
        type: 'PASSWORD_RESET',
        expiresAt: {
          gt: new Date(),
        },
        verifiedAt: null,
      },
    });

    if (!otp) {
      throw new BadRequestException(
        this.configService.getOrThrow<string>('messages.otp.invalid'),
      );
    }

    // Find the user identity
    const identity = await this.prisma.identity.findFirst({
      where: {
        OR: [
          { providerId: target, provider: 'EMAIL' },
          { providerId: target, provider: 'PHONE' },
        ],
      },
      include: {
        user: true,
      },
    });

    if (!identity) {
      throw new NotFoundException('User not found');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in user table
    await this.prisma.user.update({
      where: { id: identity.userId },
      data: { password: hashedPassword },
    });

    // Mark OTP as verified
    await this.prisma.otp.update({
      where: { id: otp.id },
      data: { verifiedAt: new Date() },
    });

    return {
      message: 'Password reset successfully',
    };
  }
}
