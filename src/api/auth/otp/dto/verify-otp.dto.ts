import { ApiProperty } from '@nestjs/swagger';
import { OtpType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The target for the OTP (email or phone number)',
  })
  @IsString()
  @IsNotEmpty()
  target: string; // email or phone

  @ApiProperty({ example: '123456', description: 'The 6-digit OTP code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    enum: OtpType,
    example:
      OtpType.EMAIL_VERIFICATION || OtpType.PHONE_VERIFICATION || OtpType.LOGIN,
    description: 'The type of OTP being verified',
  })
  @IsEnum(OtpType)
  @IsNotEmpty()
  type: OtpType;
}
