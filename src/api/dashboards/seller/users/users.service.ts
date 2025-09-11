import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import {
  UserResponseDto,
  PaginatedUsersResponse,
} from 'src/modules/seller/users/dto/user-response.dto';
import { AvatarsService } from 'src/modules/user/avatar/avatars.service';

export interface UserFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'firstName' | 'lastName' | 'createdAt' | 'email';
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly avatarService: AvatarsService,
  ) {}

  async getSellerUsers(
    sellerId: string,
    filters: UserFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedUsersResponse> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = pagination;

    const { search, startDate, endDate } = filters;

    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    // Build where clause for users who have appointments with this seller
    const whereClause: any = {
      userAppointments: {
        some: {
          sellerId,
        },
      },
    };

    // Add search filter
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add date filters based on appointment creation
    if (startDate || endDate) {
      whereClause.userAppointments = {
        some: {
          sellerId,
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        },
      };
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const total = await this.prisma.user.count({
      where: whereClause,
    });

    // Get users with pagination
    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: offset,
      take: limit,
    });

    // Process users to include avatar URLs
    const processedUsers: UserResponseDto[] = await Promise.all(
      users.map(async (user) => ({
        ...user,
        profileImage: await this.avatarService.getProfileAvatar(user),
      })),
    );

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      users: processedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  async getUserById(
    userId: string,
    sellerId: string,
  ): Promise<UserResponseDto> {
    // Check if user has appointments with this seller
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        userAppointments: {
          some: {
            sellerId,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      throw new BadRequestException(
        'User not found or no appointments with this seller',
      );
    }

    return {
      ...user,
      profileImage: await this.avatarService.getProfileAvatar(user),
    } as UserResponseDto;
  }

  async getUsersStats(
    sellerId: string,
  ): Promise<{
    total: number;
    active: number;
    newThisMonth: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, newThisMonth] = await Promise.all([
      // Total users with appointments
      this.prisma.user.count({
        where: {
          userAppointments: {
            some: {
              sellerId,
            },
          },
        },
      }),
      // Active users (with appointments in last 30 days)
      this.prisma.user.count({
        where: {
          userAppointments: {
            some: {
              sellerId,
              createdAt: {
                gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      }),
      // New users this month
      this.prisma.user.count({
        where: {
          userAppointments: {
            some: {
              sellerId,
              createdAt: {
                gte: startOfMonth,
              },
            },
          },
        },
      }),
    ]);

    return {
      total,
      active,
      newThisMonth,
    };
  }
}
