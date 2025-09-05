import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { HomeDataResponseDto } from './dto';

@Controller('dashboard/user/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get home data' })
  @ApiResponse({
    status: 200,
    description: 'Home data retrieved successfully',
    type: HomeDataResponseDto,
  })
  async getHomeData(@Request() req): Promise<HomeDataResponseDto> {
    return this.homeService.getHomeData(req.user.id);
  }
}
