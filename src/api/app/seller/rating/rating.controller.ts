import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingStatsResponseDto } from './dto/rating-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';

@Controller('seller/rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Get(':sellerProfileId')
  async getSellerRatingStats(
    @Param('sellerProfileId') sellerProfileId: string,
  ): Promise<RatingStatsResponseDto> {
    return this.ratingService.getSellerRatingStats(sellerProfileId);
  }

  @Get(':sellerProfileId/user-comment')
  @UseGuards(JwtAuthGuard)
  async getUserComment(
    @Param('sellerProfileId') sellerProfileId: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.ratingService.getUserComment(sellerProfileId, userId);
  }

  @Post(':sellerProfileId/comment')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param('sellerProfileId') sellerProfileId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.ratingService.createComment(
      sellerProfileId,
      createCommentDto,
      userId,
    );
  }
}
