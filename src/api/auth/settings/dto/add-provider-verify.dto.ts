import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { AuthProvider } from '@prisma/client';

export class AddProviderVerifyDto {
  @ApiProperty({
    enum: AuthProvider,
    example: AuthProvider.EMAIL,
    description: 'Provider type to add (EMAIL or PHONE)',
  })
  @IsEnum(AuthProvider)
  provider: AuthProvider;

  @ApiProperty({
    example: 'newuser@example.com',
    description: 'The new email or phone number to add',
  })
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({
    example: '123456',
    description: 'OTP code sent to the new provider',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
