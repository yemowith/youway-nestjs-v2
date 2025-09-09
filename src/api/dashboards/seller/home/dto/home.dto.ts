import { ApiProperty } from '@nestjs/swagger';
import { RatingStatsResponseDto } from 'src/api/app/seller/rating/dto/rating-response.dto';
import { SellerPackageDto } from 'src/modules/seller/packages/dto/seller-package.dto';

export class UserDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User first name' })
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  lastName: string;

  @ApiProperty({ description: 'User profile image', required: false })
  profileImage?: string;
}

export class PackageDto {
  @ApiProperty({ description: 'Package ID' })
  id: string;

  @ApiProperty({ description: 'Package title' })
  title: string;

  @ApiProperty({ description: 'Package description', required: false })
  description?: string;

  @ApiProperty({ description: 'Package duration in minutes' })
  durationMin: number;

  @ApiProperty({
    description: 'Package commission percentage',
    required: false,
  })
  commission?: any;
}

export class AppointmentDto {
  @ApiProperty({ description: 'Appointment ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Seller ID' })
  sellerId: string;

  @ApiProperty({ description: 'Package ID' })
  packageId: string;

  @ApiProperty({ description: 'Appointment start time' })
  startTime: Date;

  @ApiProperty({ description: 'Appointment end time' })
  endTime: Date;

  @ApiProperty({ description: 'Appointment status' })
  status: string;

  @ApiProperty({ description: 'Appointment creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'User details', type: UserDto, required: false })
  user?: UserDto;

  @ApiProperty({
    description: 'Seller details',
    type: UserDto,
    required: false,
  })
  seller?: UserDto;

  @ApiProperty({
    description: 'Package details',
    type: SellerPackageDto,
    required: false,
  })
  package?: SellerPackageDto;
}

export class MessageDto {
  @ApiProperty({ description: 'Message ID' })
  id: string;

  @ApiProperty({ description: 'Message content' })
  content: string;

  @ApiProperty({ description: 'Message type', required: false })
  type?: string | null;

  @ApiProperty({ description: 'Is message read' })
  isRead: boolean;

  @ApiProperty({ description: 'Is message deleted' })
  isDeleted: boolean;

  @ApiProperty({ description: 'Message creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Message read date', required: false })
  isReadAt?: Date | null;

  @ApiProperty({ description: 'Sender ID' })
  senderId: string;

  @ApiProperty({ description: 'Receiver ID' })
  receiverId: string;

  @ApiProperty({ description: 'Sender details', type: UserDto })
  sender: UserDto;

  @ApiProperty({ description: 'Receiver details', type: UserDto })
  receiver: UserDto;
}

export class StatisticsDto {
  @ApiProperty({ description: 'Current monthly revenue' })
  currentMonthlyRevenue: number;

  @ApiProperty({ description: 'Last monthly difference percentage' })
  lastMonthlyDifferencePercentage: number;

  @ApiProperty({ description: 'Completed appointments count' })
  completedAppointments: number;

  @ApiProperty({ description: 'Average per session (Seans başına ortalama)' })
  seansBasiOrtalama: number;

  @ApiProperty({ description: 'Total commissions amount' })
  totalCommissions: number;

  @ApiProperty({ description: 'Total sessions count' })
  totalSessions: number;

  @ApiProperty({ description: 'Current month commissions' })
  currentMonthCommissions: number;

  @ApiProperty({ description: 'Last month commissions' })
  lastMonthCommissions: number;
}

export class HomeDataDto {
  @ApiProperty({
    description: 'Latest appointment',
    type: AppointmentDto,
    required: false,
  })
  latestAppointment?: AppointmentDto;

  @ApiProperty({ description: 'Statistics data', type: StatisticsDto })
  statistics: StatisticsDto;

  @ApiProperty({
    description: 'Rating statistics',
    type: RatingStatsResponseDto,
  })
  ratingStats: RatingStatsResponseDto;

  @ApiProperty({ description: 'Last messages', type: [MessageDto] })
  lastMessages: MessageDto[];

  @ApiProperty({ description: 'Last appointments', type: [AppointmentDto] })
  lastAppointments: AppointmentDto[];

  @ApiProperty({ description: 'Today appointments', type: [AppointmentDto] })
  todayAppointments: AppointmentDto[];
}
