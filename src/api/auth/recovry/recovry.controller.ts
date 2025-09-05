import { Controller, Post, Body } from '@nestjs/common';
import { RecovryService } from './recovry.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth / Password Recovery')
@Controller('auth/recovery')
export class RecovryController {
  constructor(private readonly recovryService: RecovryService) {}

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Send password reset OTP',
    description:
      'Send a password reset OTP to the provided email or phone number',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 201,
    description: 'Password reset OTP sent successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found with the provided email or phone number.',
  })
  @ApiResponse({
    status: 400,
    description: 'Account is not active.',
  })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.recovryService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password using OTP',
    description: 'Reset password using the OTP code sent to email or phone',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 201,
    description: 'Password reset successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP code.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.recovryService.resetPassword(resetPasswordDto);
  }
}
