import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/clients/prisma/prisma.service'
import { SendOtpDto } from './dto/send-otp.dto'
import { VerifyOtpDto } from './dto/verify-otp.dto'
import { AuthService } from '../auth.service'
import { Request } from 'express'
import { MailService } from 'src/providers/mail/mail.service'
import { SmsService } from 'src/providers/sms/sms.service'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'
import { ReferralService } from 'src/modules/user/referral/referral.service'

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly configService: ConfigService,
    private readonly referralService: ReferralService,
  ) {}

  async sendOtp(sendOtpDto: SendOtpDto) {
    const { target, type } = sendOtpDto
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await this.prisma.otp.create({
      data: {
        code: otpCode,
        target,
        type,
        expiresAt,
      },
    })

    console.log(`Generated OTP code: ${otpCode} for target: ${target}`)

    try {
      if (/\S+@\S+\.\S+/.test(target)) {
        console.log(`Sending OTP to email: ${target}`)
        await this.mailService.sendOtp(target, otpCode)
      } else {
        console.log(`Sending OTP to phone: ${target}`)
        await this.smsService.sendOtp(target, otpCode)
      }
    } catch (error) {
      console.error(`Failed to send OTP to ${target}:`, error)
      throw new BadRequestException()
    }

    console.log(`OTP sent to ${target}: ${otpCode}`)

    const messageFn = this.configService.getOrThrow<(target: string) => string>(
      'messages.otp.sent',
    )
    return { message: messageFn(target) }
  }

  async _beforeVerifyUser(user: User) {
    // Hook for logic before user verification
    // Extend this method as needed
    console.log(`Before verifying user: ${user.id}`)
  }

  async _afterVerifyUser(user: User) {
    if (!user) return
    console.log(`User verified: ${user.id}`)
    // Additional actions after user verification can be added here
    let metadata: any = {}
    if (user.metadata) {
      try {
        if (typeof user.metadata === 'string') {
          metadata = JSON.parse(user.metadata)
        } else if (typeof user.metadata === 'object') {
          metadata = user.metadata
        }
      } catch (e) {
        console.warn('Failed to parse user.metadata:', e)
      }
      if (metadata.referralCode) {
        await this.referralService.saveUserReferral(
          user.id,
          metadata.referralCode,
        )
      }
    }
  }

  async verifyOtp(req: Request, verifyOtpDto: VerifyOtpDto) {
    const { target, code, type } = verifyOtpDto

    const otp = await this.prisma.otp.findFirst({
      where: {
        target,
        type,
        code,
        verifiedAt: null,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!otp) {
      throw new BadRequestException(
        this.configService.getOrThrow<string>('messages.otp.invalid'),
      )
    }

    await this.prisma.otp.update({
      where: {
        id: otp.id,
      },
      data: {
        verifiedAt: new Date(),
      },
    })

    if (type === 'LOGIN') {
      const identity = await this.prisma.identity.findUnique({
        where: {
          provider_providerId: {
            provider: 'PHONE',
            providerId: target,
          },
          user: {
            status: 'ACTIVE',
          },
        },
        include: {
          user: true,
        },
      })

      if (!identity) {
        throw new BadRequestException(
          'User with this phone number does not exist.',
        )
      }

      return this.authService.generateLoginResponse(identity.user)
    }

    if (type === 'PHONE_VERIFICATION') {
      const identity = await this.prisma.identity.findFirst({
        where: { providerId: target, provider: 'PHONE' },
        include: { user: true },
      })

      if (identity) {
        await this._beforeVerifyUser(identity.user)
        await this.prisma.user.update({
          where: { id: identity.userId },
          data: { status: 'ACTIVE' },
        })

        await this._afterVerifyUser(identity.user)
      }
    }

    if (type === 'EMAIL_VERIFICATION') {
      const identity = await this.prisma.identity.findFirst({
        where: { providerId: target, provider: 'EMAIL' },
        include: { user: true },
      })

      if (identity) {
        await this._beforeVerifyUser(identity.user)
        await this.prisma.user.update({
          where: { id: identity.userId },
          data: { status: 'ACTIVE' },
        })

        await this._afterVerifyUser(identity.user)
      }
    }

    return {
      message: this.configService.getOrThrow<string>('messages.otp.verified'),
    }
  }
}
