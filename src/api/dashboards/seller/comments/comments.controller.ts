import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtSellerGuard } from 'src/api/auth/guards/jwt-seller.guard';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('dashboard/seller/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  async getSellerComment(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sortBy') sortBy?: 'createdAt' | 'stars',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return await this.commentsService.getSellerComments(req.user.id, {
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }
}
