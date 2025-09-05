import { Body, Controller, Post, Req } from '@nestjs/common';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OtpService } from './otp.service';
import { Request } from 'express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth / OTP')
@Controller('auth/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send an OTP to a user' })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({ status: 201, description: 'OTP sent successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.otpService.sendOtp(sendOtpDto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify an OTP' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 201,
    description: 'OTP verified successfully. Returns auth tokens on success.',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP code.' })
  verifyOtp(@Req() req: Request, @Body() verifyOtpDto: VerifyOtpDto) {
    return this.otpService.verifyOtp(req, verifyOtpDto);
  }
}
