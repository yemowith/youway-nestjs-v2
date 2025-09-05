import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { SellerPackageDto } from '../../packages/dto';

export class UserDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;
}

export class SellerDto {
  @ApiProperty({
    description: 'Seller ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  id: string;

  @ApiProperty({
    description: 'Seller first name',
    example: 'Jane',
  })
  firstName: string;

  @ApiProperty({
    description: 'Seller last name',
    example: 'Smith',
  })
  lastName: string;

  @ApiProperty({
    description: 'Seller profile image',
    example: 'https://example.com/profile.jpg',
  })
  profileImage?: string;
}

export class PackageDto {
  @ApiProperty({
    description: 'Package ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  id: string;

  @ApiProperty({
    description: 'Package name',
    example: '30 Dk Görüşme',
  })
  name: string;

  @ApiProperty({
    description: 'Package duration in minutes',
    example: 30,
  })
  durationMin: number;

  @ApiProperty({
    description: 'Package price',
    example: 700,
  })
  price: any; // Decimal type from Prisma
}

export class AppointmentResponseDto {
  @ApiProperty({
    description: 'Appointment ID',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Seller ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  sellerId: string;

  @ApiProperty({
    description: 'Package ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  packageId: string;

  @ApiProperty({
    description: 'Appointment start time',
    example: '2024-01-15T10:00:00.000Z',
  })
  startTime: Date;

  @ApiProperty({
    description: 'Appointment end time',
    example: '2024-01-15T10:30:00.000Z',
  })
  endTime: Date;

  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
  })
  status: string;

  @ApiProperty({
    description: 'Appointment creation date',
    example: '2024-01-10T08:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'User details',
    type: UserDto,
  })
  user?: UserDto;

  @ApiPropertyOptional({
    description: 'Seller details',
    type: SellerDto,
  })
  seller?: SellerDto;

  @ApiPropertyOptional({
    description: 'Package details',
    type: SellerPackageDto,
  })
  package?: SellerPackageDto;
}
