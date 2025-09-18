import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { AppointmentStatus, UserStatus } from '@prisma/client';
import { RatingService } from 'src/api/app/seller/rating/rating.service';
import { AvatarsService } from '../../../../modules/user/avatar/avatars.service';
import { ReferralService } from '../../../../modules/user/referral/referral.service';
import { AppointmentService } from 'src/modules/seller/appointment/appointment.service';
import { PackagesService } from 'src/modules/seller/packages/packages.service';

@Injectable()
export class HomeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ratingService: RatingService,
    private readonly avatarService: AvatarsService,
    private readonly referralService: ReferralService,
    private readonly appointmentsService: AppointmentService,
    private readonly packagesService: PackagesService,
  ) {}

  async getSellersList(userId: string) {
    // Get unique sellers that the user has made appointments with
    const appointments = await this.prisma.appointment.findMany({
      where: {
        userId: userId,
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.COMPLETED],
        },
        seller: {
          status: UserStatus.ACTIVE,
        },
      },
      include: {
        seller: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    // Get seller profiles with relations
    const sellerProfiles = await this.prisma.sellerProfile.findMany({
      where: {
        userId: {
          in: appointments.map((appointment) => appointment.seller.id),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true,
            about: true,
            identities: {
              select: {
                provider: true,
                providerId: true,
              },
            },
          },
        },
        therapies: {
          include: {
            therapy: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        therapySchools: {
          include: {
            therapySchool: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        comments: {
          where: {
            status: 'APPROVED',
          },
          select: {
            id: true,
            content: true,
            stars: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      take: 10,
    });

    // Add rating data to seller profiles using the rating service
    const sellersWithRating = await this.ratingService.addRatingDataToSellers(
      sellerProfiles,
    );

    const profiles = await Promise.all(
      sellersWithRating.map(async (seller) => ({
        ...seller,
        profileImage: await this.avatarService.getProfileAvatar(seller.user),
        packages: await this.packagesService.getSellerPackages(seller.userId),
      })),
    );

    return profiles;
  }

  async getStatistics(userId: string) {
    const statistics = await this.appointmentsService.getAppointmentsStats({
      userId,
    });
    return statistics;
  }

  async getReferralProfile(userId: string) {
    const referral = await this.referralService.getUserReferral(userId);
    return referral;
  }

  async getLatestAppointment(userId: string) {
    const appointment = await this.appointmentsService.getLastScheduledUserAppointment(
      {
        userId,
      },
    );
    return appointment;
  }

  async getLastSellers() {
    const sellers = await this.prisma.sellerProfile.findMany({
      where: {
        sellerProfileImage: {
          thumbnailUrl: {
            not: null,
          },
        },
      },
      select: {
        id: true,
        sellerProfileImage: {
          select: {
            thumbnailUrl: true,
          },
        },
      },
      take: 4,
    });
    return sellers;
  }

  async getHomeData(userId: string) {
    const latestAppointment = await this.getLatestAppointment(userId);
    const sellers = await this.getSellersList(userId);
    const referral = await this.getReferralProfile(userId);
    const statistics = await this.getStatistics(userId);
    const lastSellers = await this.getLastSellers();
    return {
      latestAppointment,
      sellers,
      referral,
      statistics,
      lastSellers,
    };
  }
}
