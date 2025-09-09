import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtSellerGuard } from 'src/api/auth/guards/jwt-seller.guard';
import { HomeDataDto, StatisticsDto } from './dto/home.dto';

@Controller('dashboard/seller/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get home data' })
  @ApiResponse({
    status: 200,
    description: 'Home data retrieved successfully',
    type: HomeDataDto,
  })
  async getHomeData(@Request() req): Promise<HomeDataDto> {
    return this.homeService.getHomeData(req.user.id);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get seller statistics including seans başına ortalama',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: StatisticsDto,
  })
  async getStatistics(@Request() req): Promise<StatisticsDto> {
    return this.homeService.getStatistics(req.user.id);
  }
}
