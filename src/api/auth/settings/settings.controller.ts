import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common'
import { SettingsService } from './settings.service'
import { SettingsChangePasswordDto } from './dto/change-password.dto'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { Request } from 'express'
import { User } from '@prisma/client'
import { AddProviderRequestDto } from './dto/add-provider-request.dto'
import { AddProviderVerifyDto } from './dto/add-provider-verify.dto'
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard'

@ApiTags('Auth / Settings')
@Controller('auth/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Change user password',
    description:
      'Change password for authenticated user (requires current password)',
  })
  @ApiBody({ type: SettingsChangePasswordDto })
  @ApiResponse({
    status: 201,
    description: 'Password changed successfully.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized - Invalid current password or missing JWT token.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - No password-based account found or new password same as current.',
  })
  changePassword(
    @Req() req: Request,
    @Body() changePasswordDto: SettingsChangePasswordDto,
  ) {
    const user = req.user as User
    return this.settingsService.changePassword(user, changePasswordDto)
  }

  @Post('add-provider/request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Request to add a new provider (email or phone) to user',
    description: 'Sends an OTP to the new provider for verification.',
  })
  @ApiBody({ type: AddProviderRequestDto })
  @ApiResponse({ status: 201, description: 'OTP sent to the new provider.' })
  @ApiResponse({ status: 400, description: 'Provider is already in use.' })
  requestAddProvider(@Req() req: Request, @Body() dto: AddProviderRequestDto) {
    const user = req.user as User
    return this.settingsService.requestAddProvider(user, dto)
  }

  @Post('add-provider/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Verify OTP and add new provider (email or phone) to user',
    description: 'Verifies the OTP and adds the provider to the user.',
  })
  @ApiBody({ type: AddProviderVerifyDto })
  @ApiResponse({ status: 201, description: 'Provider added successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP code.' })
  verifyAddProvider(@Req() req: Request, @Body() dto: AddProviderVerifyDto) {
    const user = req.user as User
    return this.settingsService.verifyAddProvider(user, dto)
  }
}
