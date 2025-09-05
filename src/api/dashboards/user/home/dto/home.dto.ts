import { ApiProperty } from '@nestjs/swagger'

// Extended UserDto with profileImage for home module
export class UserDto {
  @ApiProperty({ description: 'User ID' })
  id: string

  @ApiProperty({ description: 'User first name' })
  firstName: string

  @ApiProperty({ description: 'User last name' })
  lastName: string

  @ApiProperty({ description: 'User profile image', required: false })
  profileImage?: string
}

export class TherapyDto {
  @ApiProperty({ description: 'Therapy ID' })
  id: string

  @ApiProperty({ description: 'Therapy name' })
  name: string

  @ApiProperty({ description: 'Therapy description', required: false })
  description?: string
}

export class TherapySchoolDto {
  @ApiProperty({ description: 'Therapy school ID' })
  id: string

  @ApiProperty({ description: 'Therapy school name' })
  name: string

  @ApiProperty({ description: 'Therapy school description', required: false })
  description?: string
}

export class CommentDto {
  @ApiProperty({ description: 'Comment ID' })
  id: string

  @ApiProperty({ description: 'Comment content' })
  content: string

  @ApiProperty({ description: 'Comment rating stars', required: false })
  stars?: number

  @ApiProperty({ description: 'Comment creation date' })
  createdAt: Date

  @ApiProperty({ description: 'User who wrote the comment' })
  user: UserDto
}

export class SellerProfileDto {
  @ApiProperty({ description: 'Seller profile ID' })
  id: string

  @ApiProperty({ description: 'User ID' })
  userId: string

  @ApiProperty({ description: 'Seller slug' })
  slug: string

  @ApiProperty({ description: 'Seller about information', required: false })
  about?: string

  @ApiProperty({ description: 'Seller job title', required: false })
  jobTitle?: string

  @ApiProperty({ description: 'Seller education info', required: false })
  educationInfo?: string

  @ApiProperty({ description: 'Seller experience info', required: false })
  experienceInfo?: string

  @ApiProperty({ description: 'Seller certificate info', required: false })
  certificateInfo?: string

  @ApiProperty({ description: 'Seller website', required: false })
  website?: string

  @ApiProperty({ description: 'Seller video URL', required: false })
  videoUrl?: string

  @ApiProperty({ description: 'Seller country code', required: false })
  countryCode?: string

  @ApiProperty({ description: 'Seller address', required: false })
  address?: string

  @ApiProperty({ description: 'Seller status' })
  status: string

  @ApiProperty({ description: 'Seller creation date' })
  createdAt: Date

  @ApiProperty({ description: 'Seller update date' })
  updatedAt: Date

  @ApiProperty({ description: 'User information' })
  user: UserDto

  @ApiProperty({ description: 'Seller therapies' })
  therapies: Array<{ therapy: TherapyDto }>

  @ApiProperty({ description: 'Seller therapy schools' })
  therapySchools: Array<{ therapySchool: TherapySchoolDto }>

  @ApiProperty({ description: 'Seller comments/reviews' })
  comments: CommentDto[]

  @ApiProperty({ description: 'Seller profile image' })
  profileImage: string

  @ApiProperty({ description: 'Seller rating data', required: false })
  ratingData?: any
}

export class StatisticsDto {
  @ApiProperty({ description: 'Total appointments count' })
  appointments: number

  @ApiProperty({ description: 'Appointments count this month' })
  appointmentsThisMonth: number
}

export class ReferralDto {
  @ApiProperty({ description: 'Referral ID' })
  id: string

  @ApiProperty({ description: 'User ID' })
  userId: string

  @ApiProperty({ description: 'Referral code' })
  referralCode: string

  @ApiProperty({ description: 'Referral creation date' })
  createdAt: Date

  @ApiProperty({ description: 'Referral update date' })
  updatedAt: Date
}

export class HomeDataResponseDto {
  @ApiProperty({
    description: 'List of sellers the user has appointments with',
  })
  sellers: SellerProfileDto[]

  @ApiProperty({ description: 'User referral information', required: false })
  referral?: ReferralDto | null

  @ApiProperty({ description: 'User statistics' })
  statistics: StatisticsDto
}
