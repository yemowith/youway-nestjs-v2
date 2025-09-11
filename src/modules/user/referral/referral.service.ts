import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import {
  UserProfileDto,
  UserReferralWithProfileDto,
} from 'src/api/dashboards/user/referral/dto/referral.dto';
import {
  NewReferralRegisteredEvent,
  REFERRAL_EVENTS,
} from 'src/events/referral/referral.events';
import { AvatarsService } from '../avatar/avatars.service';
import { randomBytes } from 'crypto';

@Injectable()
export class ReferralService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly avatarsService: AvatarsService,
  ) {}

  async isCodeExists(referralCode: string): Promise<boolean> {
    const referral = await this.prisma.userReferral.findFirst({
      where: { referralCode },
      select: { id: true },
    });

    return !!referral;
  }

  async getCountChildren(referralId: string): Promise<number> {
    const count = await this.prisma.userReferral.count({
      where: { referralId },
    });

    return count;
  }

  async getUserReferral(userId: string): Promise<UserReferralWithProfileDto> {
    const referral = await this.prisma.userReferral.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        referral: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!referral) {
      throw new NotFoundException(
        'User referral not found. Please register first.',
      );
    }

    const userProfile: UserProfileDto = {
      id: referral.user.id,
      firstName: referral.user.firstName,
      lastName: referral.user.lastName,
      fullName: `${referral.user.firstName} ${referral.user.lastName}`.trim(),
      profileImage:
        referral.user.profileImage ||
        (await this.avatarsService.getProfileAvatar(referral.user)),
    };

    const sponsorProfile: UserProfileDto | undefined = referral.referral
      ? {
          id: referral.referral.id,
          firstName: referral.referral.firstName,
          lastName: referral.referral.lastName,
          fullName: `${referral.referral.firstName} ${referral.referral.lastName}`.trim(),
          profileImage:
            referral.user.profileImage ||
            (await this.avatarsService.getProfileAvatar(referral.referral)),
        }
      : undefined;

    const childrenCount = await this.getCountChildren(referral.userId);

    return {
      id: referral.id,
      userId: referral.userId,
      referralCode: referral.referralCode,
      referralId: referral.referralId,
      user: userProfile,
      sponsor: sponsorProfile,
      childrenCount: childrenCount,
      createdAt: referral.createdAt,
      updatedAt: referral.updatedAt,
    };
  }

  async getUserChildren(userId: string): Promise<UserReferralWithProfileDto[]> {
    const referrals = await this.prisma.userReferral.findMany({
      where: { referralId: userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        referral: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const referralsWithCounts = await Promise.all(
      referrals.map(async (referral) => {
        const userProfile: UserProfileDto = {
          id: referral.user.id,
          firstName: referral.user.firstName,
          lastName: referral.user.lastName,
          fullName: `${referral.user.firstName} ${referral.user.lastName}`.trim(),
          profileImage:
            referral.user.profileImage ||
            (await this.avatarsService.getProfileAvatar(referral.user)),
        };

        const sponsorProfile: UserProfileDto | undefined = referral.referral
          ? {
              id: referral.referral.id,
              firstName: referral.referral.firstName,
              lastName: referral.referral.lastName,
              fullName: `${referral.referral.firstName} ${referral.referral.lastName}`.trim(),
              profileImage:
                referral.user.profileImage ||
                (await this.avatarsService.getProfileAvatar(referral.referral)),
            }
          : undefined;

        const childrenCount = await this.getCountChildren(referral.userId);

        return {
          id: referral.id,
          userId: referral.userId,
          referralCode: referral.referralCode,
          referralId: referral.referralId,
          user: userProfile,
          sponsor: sponsorProfile,
          childrenCount,
          createdAt: referral.createdAt,
          updatedAt: referral.updatedAt,
        };
      }),
    );

    return referralsWithCounts;
  }

  private async generateUniqueReferralCode(): Promise<string> {
    let referralCode: string = '';
    let isCodeUnique = false;

    while (!isCodeUnique) {
      // Generate an 8-character uppercase hex string
      referralCode = randomBytes(4).toString('hex').toUpperCase();
      const existingReferral = await this.prisma.userReferral.findFirst({
        where: { referralCode },
      });
      if (!existingReferral) {
        isCodeUnique = true;
      }
    }
    return referralCode;
  }

  async generateReferralProfile(userId: string) {
    const userReferralCount = await this.prisma.userReferral.count({
      where: { userId },
    });

    if (userReferralCount > 0) {
      return; // Profile already exists
    }

    const newReferralCode = await this.generateUniqueReferralCode();

    await this.prisma.userReferral.create({
      data: {
        userId: userId,
        referralCode: newReferralCode,
      },
    });
  }

  async saveUserReferral(
    userId: string,
    referralCode: string,
  ): Promise<UserReferralWithProfileDto> {
    const userReferral = await this.prisma.userReferral.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    if (!userReferral) {
      throw new BadRequestException('User referral not found');
    }

    // Check referral code is valid and exists
    const sponsorReferral = await this.prisma.userReferral.findFirst({
      where: { referralCode },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    if (!sponsorReferral) {
      throw new BadRequestException('Referral code not found');
    }

    await this.prisma.userReferral.update({
      where: { userId },
      data: {
        referralId: sponsorReferral.userId,
      },
    });

    // Emit referral registered event
    const referralRegisteredEvent: NewReferralRegisteredEvent = {
      userId: userId,
      sponsorId: sponsorReferral.userId,
      referralCode: referralCode,
      timestamp: new Date(),
    };
    this.eventEmitter.emit(REFERRAL_EVENTS.REGISTERED, referralRegisteredEvent);

    const userProfile: UserProfileDto = {
      id: userReferral.id,
      firstName: userReferral.user.firstName,
      lastName: userReferral.user.lastName,
      fullName: `${userReferral.user.firstName} ${userReferral.user.lastName}`.trim(),
      profileImage:
        userReferral.user.profileImage ||
        (await this.avatarsService.getProfileAvatar(userReferral.user)),
    };

    const sponsorProfile: UserProfileDto = {
      id: sponsorReferral.userId,
      firstName: sponsorReferral.user.firstName,
      lastName: sponsorReferral.user.lastName,
      fullName: `${sponsorReferral.user.firstName} ${sponsorReferral.user.lastName}`.trim(),
      profileImage:
        sponsorReferral.user.profileImage ||
        (await this.avatarsService.getProfileAvatar(sponsorReferral.user)),
    };

    const childrenCount = await this.getCountChildren(userReferral.userId);

    return {
      id: sponsorReferral.id,
      userId: userReferral.userId,
      referralCode: sponsorReferral.referralCode,
      referralId: sponsorReferral.userId,
      user: userProfile,
      sponsor: sponsorProfile,
      childrenCount,
      createdAt: sponsorReferral.createdAt,
      updatedAt: sponsorReferral.updatedAt,
    };
  }
}
