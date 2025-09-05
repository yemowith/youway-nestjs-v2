import { ApiProperty } from '@nestjs/swagger';
import { OtpType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The target for the OTP (email or phone number)',
  })
  @IsString()
  @IsNotEmpty()
  target: string;

  @ApiProperty({
    enum: OtpType,
    example: OtpType.EMAIL_VERIFICATION,
    description: 'The type of OTP to send',
  })
  @IsEnum(OtpType)
  @IsNotEmpty()
  type: OtpType;
}
