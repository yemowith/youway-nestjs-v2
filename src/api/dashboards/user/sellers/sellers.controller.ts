import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@Controller('dashboards/user/sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  async getSellersList(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user.id;
    const pageNumber = page || 1;
    const pageLimit = limit || 10;

    return this.sellersService.getSellersList(userId, pageNumber, pageLimit);
  }
}
