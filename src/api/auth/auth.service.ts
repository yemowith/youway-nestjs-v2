import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../clients/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthProvider, User } from '@prisma/client';
import { Request } from 'express';
import { ProfilesService } from '../dashboards/user/profiles/profiles.service';
import { SessionDto, UserDto } from './dto/session-response.dto';
import { ProfileResponseDto } from '../dashboards/user/profiles/dto/profile.dto';
import { LoginResponseDto } from './signin/dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly profilesService: ProfilesService,
  ) {}

  async refreshToken(userId: string, refreshToken: string, req: Request) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // For now, we'll skip device validation since the feature isn't active yet
    // TODO: Implement device validation when the feature is ready
    // const allRefreshTokens = user.devices.flatMap(
    //   (device) => device.refreshTokens,
    // );
    // const activeToken = allRefreshTokens.find((token) => !token.revokedAt);
    // if (!activeToken) {
    //   throw new Error('No active refresh token');
    // }
    // const isTokenMatch = await bcrypt.compare(
    //   refreshToken,
    //   activeToken.hashedToken,
    // );
    // if (!isTokenMatch) {
    //   throw new Error('Invalid refresh token');
    // }

    // Generate new session without device validation
    return this.generateSession(user);
  }

  private parseDuration(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return parseInt(duration, 10) * 1000; // Default to seconds
    }
  }

  private hasPhone(identities: { provider: AuthProvider }[]): boolean {
    return identities.some(
      (identity) => identity.provider === AuthProvider.PHONE,
    );
  }

  private hasEmail(identities: { provider: AuthProvider }[]): boolean {
    return identities.some(
      (identity) => identity.provider === AuthProvider.EMAIL,
    );
  }

  private hasGoogle(identities: { provider: AuthProvider }[]): boolean {
    return identities.some(
      (identity) => identity.provider === AuthProvider.GOOGLE,
    );
  }

  public async getUser(userId: string): Promise<UserDto> {
    const userWithDetails = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        metadata: true,
        status: true,
        identities: {
          select: {
            provider: true,
            providerId: true,
          },
        },
      },
    });

    if (!userWithDetails) {
      throw new BadRequestException('User not found.');
    }

    return {
      id: userWithDetails.id,
      metadata: userWithDetails.metadata,
      identities: userWithDetails.identities,
      status: userWithDetails.status,
      hasPhone: this.hasPhone(userWithDetails.identities),
      hasEmail: this.hasEmail(userWithDetails.identities),
      hasGoogle: this.hasGoogle(userWithDetails.identities),
    };
  }

  public async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.profilesService.getProfileById(userId);
    return user;
  }

  public async generateSession(user: User): Promise<SessionDto> {
    const payload = { sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('jwt.secret'),
      expiresIn: this.configService.getOrThrow<string>(
        'jwt.refreshTokenExpirationTime',
      ),
    });

    // Calculate expiration times
    const accessTokenExpiresIn = this.configService.getOrThrow<string>(
      'jwt.accessTokenExpirationTime',
    );
    const refreshTokenExpiresIn = this.configService.getOrThrow<string>(
      'jwt.refreshTokenExpirationTime',
    );

    const now = Date.now();
    const accessTokenExpiresAt = now + this.parseDuration(accessTokenExpiresIn);
    const refreshTokenExpiresAt =
      now + this.parseDuration(refreshTokenExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresAt: {
        accessToken: accessTokenExpiresAt,
        refreshToken: refreshTokenExpiresAt,
      },
    };
  }

  public async generateLoginResponse(user: User): Promise<LoginResponseDto> {
    const sessionResponse = await this.generateSession(user);
    const userResponse = await this.getUser(user.id);
    const profileResponse = await this.getProfile(user.id);

    return {
      session: sessionResponse,
      user: userResponse,
      profile: profileResponse,
    };
  }
}
