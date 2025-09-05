import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthAdminGuard } from 'src/api/auth/guards/jwt-auth-admin.guard';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get admin',
    description: 'Retrieve admin information',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved admin',
  })
  async getAdmin(@Request() req) {
    return req.admin;
  }

  @Get('home')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get admin home',
    description: 'Retrieve admin home information',
  })
  async getAdminHome(@Request() req) {
    return this.adminService.getHomeData();
  }
}
