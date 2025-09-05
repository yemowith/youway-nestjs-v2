import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address or phone number to send password reset OTP',
  })
  @IsString()
  @IsNotEmpty()
  target: string; // email or phone
}
