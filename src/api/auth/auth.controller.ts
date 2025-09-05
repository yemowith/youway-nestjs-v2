import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { Request } from 'express'
import { RefreshTokenDto } from './otp/dto/refresh-token.dto'
import { OtpService } from './otp/otp.service'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import { UserDto } from './dto/session-response.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile (requires JWT authentication)' })
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user profile.',
    type: UserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  getProfile(@Req() req) {
    return this.authService.getUser(req.user.id)
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 201,
    description: 'New access and refresh tokens generated successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid refresh token.',
  })
  refresh(@Req() req: Request, @Body() refreshTokenDto: RefreshTokenDto) {
    const { sub, refreshToken } = req.user as {
      sub: string
      refreshToken: string
    }
    return this.authService.refreshToken(sub, refreshToken, req)
  }
}
