import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { EmailLoginDto } from './dto/email-login.dto'
import { PrismaService } from 'src/clients/prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { AuthService } from '../auth.service'
import { Request, Response } from 'express'
import { PhoneLoginDto } from './dto/phone-login.dto'
import { AttemptService } from 'src/providers/attempt/attempt.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SigninService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly attemptService: AttemptService,
    private readonly configService: ConfigService,
  ) {}

  async phoneLogin(req: Request, phoneLoginDto: PhoneLoginDto): Promise<any> {
    const { phone, password } = phoneLoginDto
    await this.attemptService.checkIfBlocked(phone, 'LOGIN')

    const identity = await this.prisma.identity.findUnique({
      where: {
        provider_providerId: {
          providerId: phone,
          provider: 'PHONE',
        },
      },
      include: { user: true },
    })

    if (!identity || !identity.user.password) {
      await this.attemptService.recordFailedAttempt(phone, 'LOGIN')
      const messageFn = this.configService.getOrThrow<
        (provider: string) => string
      >('messages.auth.userNotFound')
      throw new UnauthorizedException(messageFn('phone number'))
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      identity.user.password,
    )
    if (!isPasswordValid) {
      await this.attemptService.recordFailedAttempt(phone, 'LOGIN')
      throw new UnauthorizedException(
        this.configService.getOrThrow<string>(
          'messages.auth.invalidCredentials',
        ),
      )
    }

    await this.attemptService.resetAttempts(phone, 'LOGIN')

    return this.authService.generateLoginResponse(identity.user)
  }

  async emailLogin(req: Request, emailLoginDto: EmailLoginDto) {
    const { email, password } = emailLoginDto
    await this.attemptService.checkIfBlocked(email, 'LOGIN')

    const identity = await this.prisma.identity.findUnique({
      where: {
        provider_providerId: {
          providerId: email,
          provider: 'EMAIL',
        },
      },
      include: { user: true },
    })

    if (!identity || !identity.user.password) {
      await this.attemptService.recordFailedAttempt(email, 'LOGIN')
      const messageFn = this.configService.getOrThrow<
        (provider: string) => string
      >('messages.auth.userNotFound')
      throw new UnauthorizedException(messageFn('email'))
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      identity.user.password,
    )

    if (!isPasswordValid) {
      await this.attemptService.recordFailedAttempt(email, 'LOGIN')
      throw new UnauthorizedException(
        this.configService.getOrThrow<string>(
          'messages.auth.invalidCredentials',
        ),
      )
    }

    await this.attemptService.resetAttempts(email, 'LOGIN')
    return this.authService.generateLoginResponse(identity.user)
  }
}
