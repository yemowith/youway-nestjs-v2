import { Injectable } from '@nestjs/common';
import { AppointmentStatus, UserStatus } from '@prisma/client';
import { RatingService } from 'src/api/app/seller/rating/rating.service';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { PackagesService } from 'src/modules/seller/packages/packages.service';
import { AvatarsService } from 'src/modules/user/avatar/avatars.service';

@Injectable()
export class SellersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ratingService: RatingService,
    private readonly avatarService: AvatarsService,
    private readonly packagesService: PackagesService,
  ) {}

  async getSellersList(userId: string, page: number = 1, limit: number = 10) {
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
      skip: (page - 1) * limit,
      take: limit,
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

    // Get total count for pagination
    const totalCount = await this.prisma.sellerProfile.count({
      where: {
        userId: {
          in: appointments.map((appointment) => appointment.seller.id),
        },
      },
    });

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      profiles: profiles,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }
}
