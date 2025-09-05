import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from 'src/clients/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { SettingsChangePasswordDto } from './dto/change-password.dto'
import { User } from '@prisma/client'
import { AddProviderRequestDto } from './dto/add-provider-request.dto'
import { AddProviderVerifyDto } from './dto/add-provider-verify.dto'
import { OtpService } from '../otp/otp.service'

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
  ) {}

  async changePassword(
    user: User,
    changePasswordDto: SettingsChangePasswordDto,
  ) {
    const { currentPassword, newPassword } = changePasswordDto

    const userPassword = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    })

    if (!userPassword || !userPassword.password) {
      throw new BadRequestException(
        'No password-based account found for this user',
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      userPassword.password,
    )

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect')
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(
      newPassword,
      userPassword.password,
    )
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      )
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Update the password in user table
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    })

    return {
      message: 'Password changed successfully',
    }
  }

  async requestAddProvider(user: User, dto: AddProviderRequestDto) {
    // Check if this provider is already in use by any user
    const existing = await this.prisma.identity.findUnique({
      where: {
        provider_providerId: {
          provider: dto.provider,
          providerId: dto.providerId,
        },
      },
    })
    if (existing) {
      throw new BadRequestException('This provider is already in use.')
    }

    // Check if this user already has this provider type
    const existingUserProvider = await this.prisma.identity.findFirst({
      where: {
        userId: user.id,
        provider: dto.provider,
      },
    })
    if (existingUserProvider) {
      throw new BadRequestException(
        `User already has a ${dto.provider} account`,
      )
    }

    // Send OTP for provider addition
    await this.otpService.sendOtp({
      target: dto.providerId,
      type: 'TWO_FACTOR_AUTHENTICATION',
    })
    return { message: `OTP sent to ${dto.providerId}` }
  }

  async verifyAddProvider(user: User, dto: AddProviderVerifyDto) {
    // Check OTP
    const otp = await this.prisma.otp.findFirst({
      where: {
        target: dto.providerId,
        code: dto.code,
        type: 'TWO_FACTOR_AUTHENTICATION',
        expiresAt: { gt: new Date() },
        verifiedAt: null,
      },
    })
    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP code.')
    }
    // Add provider to user
    await this.prisma.identity.create({
      data: {
        userId: user.id,
        provider: dto.provider,
        providerId: dto.providerId,
      },
    })
    // Mark OTP as used
    await this.prisma.otp.update({
      where: { id: otp.id },
      data: { verifiedAt: new Date() },
    })
    return { message: `${dto.provider} added successfully.` }
  }
}
