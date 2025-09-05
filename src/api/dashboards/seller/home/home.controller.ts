import { Controller, Get, Request, UseGuards } from '@nestjs/common'
import { HomeService } from './home.service'
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { JwtSellerGuard } from 'src/api/auth/guards/jwt-seller.guard'

@Controller('dashboard/seller/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get home data' })
  async getHomeData(@Request() req): Promise<any> {
    return this.homeService.getHomeData(req.user.id)
  }
}
