import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { RatingService } from './rating/rating.service';
import { AvatarsService } from 'src/modules/user/avatar/avatars.service';
import { SellerListQueryDto } from './dto/seller-list-query.dto';
import { SellerListResponseDto } from './dto/seller-response.dto';
import { Status, UserStatus, UserType } from '@prisma/client';
import { PackagesService } from 'src/modules/seller/packages/packages.service';

@Injectable()
export class SellerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ratingService: RatingService,
    private readonly avatarService: AvatarsService,
    private readonly packagesService: PackagesService,
  ) {}

  async listSellerProfiles(
    params: SellerListQueryDto,
  ): Promise<SellerListResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      therapyIds,
      therapySchoolIds,
    } = params;
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {
      status: Status.confirmed,
      user: {
        type: UserType.SELLER,
        status: UserStatus.ACTIVE,
      },
    };

    // Add search condition
    if (search) {
      whereConditions.OR = [
        {
          user: {
            firstName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            lastName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          jobTitle: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          educationInfo: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          experienceInfo: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          certificateInfo: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          about: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Add therapy filter
    if (therapyIds && therapyIds.length > 0) {
      // Ensure therapyIds is always an array
      const therapyIdsArray = Array.isArray(therapyIds)
        ? therapyIds
        : [therapyIds];
      whereConditions.therapies = {
        some: {
          therapyId: {
            in: therapyIdsArray,
          },
        },
      };
    }

    // Add therapy school filter
    if (therapySchoolIds && therapySchoolIds.length > 0) {
      // Ensure therapySchoolIds is always an array
      const therapySchoolIdsArray = Array.isArray(therapySchoolIds)
        ? therapySchoolIds
        : [therapySchoolIds];
      whereConditions.therapySchools = {
        some: {
          therapySchoolId: {
            in: therapySchoolIdsArray,
          },
        },
      };
    }

    // Get total count for paginationn
    const totalCount = await this.prisma.sellerProfile.count({
      where: whereConditions,
    });

    // Get seller profiles with relations
    const sellerProfiles = await this.prisma.sellerProfile.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
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
                profileImage: true,
              },
            },
          },
        },
      },
      skip,
      take: Number(limit),
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add rating data to seller profiles using the rating service
    const sellersWithRating = await this.ratingService.addRatingDataToSellers(
      sellerProfiles,
    );

    const profiles = sellersWithRating.map((seller) => ({
      ...seller,
      profileImage: this.avatarService.getProfileAvatar(seller.user),
    }));

    return {
      data: profiles,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    };
  }

  async listSellerTherapies() {
    const therapies = await this.prisma.therapy.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      rows: therapies.map((therapy) => ({
        id: therapy.id,
        name: therapy.name,
        description: therapy.description,
      })),
      total: therapies.length,
    };
  }

  async listSellerTherapySchools() {
    const therapySchools = await this.prisma.therapySchool.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      rows: therapySchools.map((therapySchool) => ({
        id: therapySchool.id,
        name: therapySchool.name,
        description: therapySchool.description,
      })),
      total: therapySchools.length,
    };
  }

  async getSellerProfileBySlug(slug: string) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: {
        slug,
        status: Status.confirmed,
        user: {
          type: 'SELLER',
          status: UserStatus.ACTIVE,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
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
                profileImage: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 15,
        },
      },
    });

    if (!sellerProfile) {
      return null;
    }

    const packages = await this.packagesService.getSellerPackages(
      sellerProfile.userId,
    );

    // Add rating data to seller profile using the rating service
    const sellerWithRating = await this.ratingService.addRatingDataToSellers([
      sellerProfile,
    ]);

    const profile = sellerWithRating[0];
    return {
      ...profile,
      packages,
      profileImage: this.avatarService.getProfileAvatar(profile.user),
    };
  }
}
