import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import {
  RatingDataDto,
  RatingStatsResponseDto,
} from './dto/rating-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user's comment for a specific seller profile
   */
  async getUserComment(sellerProfileId: string, userId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: {
        sellerProfileId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!comment) {
      return {
        success: true,
        data: null,
        message: 'No comment found for this user',
      };
    }

    return {
      success: true,
      data: {
        id: comment.id,
        content: comment.content,
        stars: comment.stars,
        status: comment.status,
        createdAt: comment.createdAt,
        user: comment.user,
      },
      message: 'Comment found',
    };
  }

  /**
   * Create a new comment for a seller profile
   */
  async createComment(
    sellerProfileId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ) {
    // Check if seller profile exists
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId },
    });

    if (!sellerProfile) {
      throw new NotFoundException('Seller profile not found');
    }

    // Check if user has already commented on this seller
    const existingComment = await this.prisma.comment.findFirst({
      where: {
        sellerProfileId,
        userId,
      },
    });

    if (existingComment) {
      throw new BadRequestException(
        'You have already commented on this seller',
      );
    }

    // Create the comment
    const comment = await this.prisma.comment.create({
      data: {
        sellerProfileId,
        userId,
        content: createCommentDto.content,
        stars: createCommentDto.stars,
        status: 'PENDING', // Comments need approval
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Comment submitted successfully and is pending approval',
      data: {
        id: comment.id,
        content: comment.content,
        stars: comment.stars,
        status: comment.status,
        createdAt: comment.createdAt,
        user: comment.user,
      },
    };
  }

  /**
   * Calculate rating data for a seller profile
   */
  async calculateSellerRating(sellerProfileId: string): Promise<RatingDataDto> {
    const comments = await this.prisma.comment.findMany({
      where: {
        sellerProfileId,
        status: 'APPROVED',
      },
      select: {
        stars: true,
      },
    });

    const totalComments = comments.length;
    const totalStars = comments.reduce(
      (sum, comment) => sum + (comment.stars || 0),
      0,
    );
    const averageRating = totalComments > 0 ? totalStars / totalComments : 0;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalComments,
      totalStars,
    };
  }

  /**
   * Calculate rating data for multiple seller profiles
   */
  async calculateMultipleSellerRatings(
    sellerProfileIds: string[],
  ): Promise<Map<string, RatingDataDto>> {
    const comments = await this.prisma.comment.findMany({
      where: {
        sellerProfileId: {
          in: sellerProfileIds,
        },
        status: 'APPROVED',
      },
      select: {
        sellerProfileId: true,
        stars: true,
      },
    });

    // Group comments by seller profile ID
    const commentsBySeller = new Map<string, { stars: number }[]>();

    for (const comment of comments) {
      const existing = commentsBySeller.get(comment.sellerProfileId) || [];
      existing.push({ stars: comment.stars || 0 });
      commentsBySeller.set(comment.sellerProfileId, existing);
    }

    // Calculate rating data for each seller
    const ratingData = new Map<string, RatingDataDto>();

    for (const sellerId of sellerProfileIds) {
      const sellerComments = commentsBySeller.get(sellerId) || [];
      const totalComments = sellerComments.length;
      const totalStars = sellerComments.reduce(
        (sum, comment) => sum + comment.stars,
        0,
      );
      const averageRating = totalComments > 0 ? totalStars / totalComments : 0;

      ratingData.set(sellerId, {
        averageRating: Math.round(averageRating * 10) / 10,
        totalComments,
        totalStars,
      });
    }

    return ratingData;
  }

  /**
   * Get rating statistics for a seller profile
   */
  async getSellerRatingStats(
    sellerProfileId: string,
  ): Promise<RatingStatsResponseDto> {
    const comments = await this.prisma.comment.findMany({
      where: {
        sellerProfileId,
        status: 'APPROVED',
      },
      select: {
        id: true,
        stars: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalComments = comments.length;
    const totalStars = comments.reduce(
      (sum, comment) => sum + (comment.stars || 0),
      0,
    );
    const averageRating = totalComments > 0 ? totalStars / totalComments : 0;

    // Calculate star distribution
    const starDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const comment of comments) {
      const stars = comment.stars || 0;
      if (stars >= 1 && stars <= 5) {
        starDistribution[stars as keyof typeof starDistribution]++;
      }
    }

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalComments,
      totalStars,
      starDistribution,
      recentComments: comments.slice(0, 10).map((comment) => ({
        ...comment,
        stars: comment.stars ?? undefined,
      })),
    };
  }

  /**
   * Add rating data to seller profiles
   */
  async addRatingDataToSellers(sellerProfiles: any[]): Promise<any[]> {
    if (sellerProfiles.length === 0) {
      return sellerProfiles;
    }

    const sellerIds = sellerProfiles.map((profile) => profile.id);
    const ratingData = await this.calculateMultipleSellerRatings(sellerIds);

    return sellerProfiles.map((profile) => {
      const rating = ratingData.get(profile.id) || {
        averageRating: 0,
        totalComments: 0,
        totalStars: 0,
      };

      return {
        ...profile,
        averageRating: rating.averageRating,
        totalComments: rating.totalComments,
        totalStars: rating.totalStars,
      };
    });
  }
}
