import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class SettingsChangePasswordDto {
  @ApiProperty({
    example: 'CurrentP@ssw0rd123',
    description: 'Current password',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string

  @ApiProperty({
    example: 'NewP@ssw0rd123',
    description: 'New password (minimum 8 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string
}
