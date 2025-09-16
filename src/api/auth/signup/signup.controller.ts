import { Controller, Post, Body, Req } from '@nestjs/common';
import { SignUpService } from './signup.service';
import { EmailRegisterDto } from './dto/email-register.dto';
import { PhoneRegisterDto } from './dto/phone-register.dto';
import { Request } from 'express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth / Sign Up')
@Controller('auth/signup')
export class SignUpController {
  constructor(private readonly signUpService: SignUpService) {}

  @Post('phone/register')
  @ApiOperation({ summary: 'Register a new user with a phone number.' })
  @ApiBody({ type: PhoneRegisterDto })
  @ApiResponse({
    status: 201,
    description:
      'Registration initiated. An OTP has been sent to the provided phone number.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  registerPhone(
    @Req() req: Request,
    @Body() phoneRegisterDto: PhoneRegisterDto,
  ) {
    return this.signUpService.phoneRegister(req, phoneRegisterDto);
  }

  @Post('email/register')
  @ApiOperation({ summary: 'Register a new user with an email address' })
  @ApiBody({ type: EmailRegisterDto })
  @ApiResponse({
    status: 201,
    description:
      'Registration initiated. A verification code has been sent to the provided email.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  registerMail(
    @Req() req: Request,
    @Body() emailRegisterDto: EmailRegisterDto,
  ) {
    return this.signUpService.emailRegister(req, emailRegisterDto);
  }
}
