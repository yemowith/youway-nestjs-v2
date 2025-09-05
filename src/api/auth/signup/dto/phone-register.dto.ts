import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class PhoneRegisterDto {
  @ApiProperty({
    example: '5551234567',
    description: 'User phone number (10 digits)',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'P@ssw0rd123',
    description: 'User password (at least 8 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    required: false,
    example: { preferredLanguage: 'en' },
    description: 'Optional metadata object',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ example: 'ABC123', required: false })
  @IsString()
  @IsOptional()
  referralCode?: string;

  @ApiProperty({ example: 'TR', required: false })
  @IsString()
  @IsOptional()
  countryCode?: string;
}
