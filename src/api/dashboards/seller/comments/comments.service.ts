import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { AvatarsService } from 'src/modules/user/avatar/avatars.service';

interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: 'createdAt' | 'stars';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedCommentsResponse {
  comments: Array<{
    id: string;
    content: string;
    stars: number | null;
    createdAt: Date;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage: string | null;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly avatarsService: AvatarsService,
  ) {}

  async getSellerComments(
    sellerProfileId: string,
    params: PaginationParams,
  ): Promise<PaginatedCommentsResponse> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const profile = await this.prisma.sellerProfile.findUnique({
      where: {
        userId: sellerProfileId,
      },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    // Build where clause
    const where: any = {
      sellerProfileId: profile.id,
    };

    // Get total coun
    const total = await this.prisma.comment.count({ where });

    // Get comments with pagination
    const comments = await this.prisma.comment.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
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

    // Process comments to include avatar URLs
    const processedComments = await Promise.all(
      comments.map(async (comment) => ({
        id: comment.id,
        content: comment.content,
        stars: comment.stars,
        status: comment.status,
        createdAt: comment.createdAt,
        user: {
          ...comment.user,
          profileImage: await this.avatarsService.getProfileAvatar(
            comment.user,
          ),
        },
      })),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      comments: processedComments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
