import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { EmailLoginDto } from './dto/email-login.dto'
import { SigninService } from './signin.service'
import { Request, Response } from 'express'
import { AuthGuard } from '@nestjs/passport'
import { PhoneLoginDto } from './dto/phone-login.dto'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { LoginResponseDto } from './dto/login-response.dto'

@ApiTags('Auth / Sign In')
@Controller('auth/signin')
export class SigninController {
  constructor(private readonly signinService: SigninService) {}

  @Post('phone/login')
  @ApiOperation({ summary: 'Log in with phone number and password' })
  @ApiBody({ type: PhoneLoginDto })
  @ApiResponse({
    status: 201,
    description: 'Login successful, returns auth tokens.',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  loginPhone(@Req() req: Request, @Body() phoneLoginDto: PhoneLoginDto) {
    return this.signinService.phoneLogin(req, phoneLoginDto)
  }

  @Post('email/login')
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiBody({ type: EmailLoginDto })
  @ApiResponse({
    status: 201,
    description: 'Login successful, returns auth tokens.',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  login(@Req() req: Request, @Body() emailLoginDto: EmailLoginDto) {
    return this.signinService.emailLogin(req, emailLoginDto)
  }
}
