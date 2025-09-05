import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class UserReferralResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: 'REF123' })
  @IsString()
  referralCode: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  sponsorId?: string;

  @ApiProperty({ example: '2024-03-20T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-03-20T12:00:00Z' })
  updatedAt: Date;
}

export class UserProfileDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User first name' })
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  lastName: string;

  @ApiProperty({ description: 'User full name' })
  fullName: string;

  @IsOptional()
  @IsString()
  profileImage: string;
}

export class UserReferralWithProfileDto {
  @ApiProperty({ description: 'Referral record ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Referral code' })
  referralCode: string;

  @ApiProperty({ description: 'Referrer ID', required: false })
  referralId?: string | null;

  @ApiProperty({
    description: 'User profile information',
    type: UserProfileDto,
  })
  user: UserProfileDto;

  @ApiProperty({
    description: 'Sponsor profile information',
    type: UserProfileDto,
    required: false,
  })
  sponsor?: UserProfileDto;

  @ApiProperty({ description: 'Number of children referrals' })
  childrenCount: number;

  @ApiProperty({ example: '2024-03-20T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-03-20T12:00:00Z' })
  updatedAt: Date;
}
