import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

class ExpiresAtDto {
  @ApiProperty({
    description: 'Access token expiration timestamp.',
    example: 1625246400000,
  })
  @Expose()
  accessToken: number;

  @ApiProperty({
    description: 'Refresh token expiration timestamp.',
    example: 1627838400000,
  })
  @Expose()
  refreshToken: number;
}

export class SessionDto {
  @ApiProperty({
    description: 'The access token.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    description: 'The refresh token.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  refreshToken: string;

  @ApiProperty({ type: ExpiresAtDto })
  @Expose()
  @Type(() => ExpiresAtDto)
  expiresAt: ExpiresAtDto;
}

export class UserIdentityDto {
  @ApiProperty({
    description: 'The identity provider.',
    example: 'google',
  })
  @Expose()
  provider: string;

  @ApiProperty({
    description: 'The user ID from the provider.',
    example: '1234567890',
  })
  @Expose()
  providerId: string;
}

export class UserDto {
  @ApiProperty({
    description: "The user's unique identifier.",
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Additional user metadata.',
    example: { phone: '+123456789' },
    nullable: true,
  })
  @Expose()
  metadata: any;

  @ApiProperty({
    description: 'The identities of the user.',
    type: [UserIdentityDto],
  })
  @Expose()
  @Type(() => UserIdentityDto)
  identities: UserIdentityDto[];

  @ApiProperty({
    description: 'The user status.',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @Expose()
  status: UserStatus;

  @ApiProperty({
    description: 'Whether the user has a phone identity.',
    example: true,
  })
  @Expose()
  hasPhone: boolean;

  @ApiProperty({
    description: 'Whether the user has an email identity.',
    example: true,
  })
  @Expose()
  hasEmail: boolean;

  @ApiProperty({
    description: 'Whether the user has a Google identity.',
    example: false,
  })
  @Expose()
  hasGoogle: boolean;
}
