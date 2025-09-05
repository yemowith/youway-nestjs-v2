import { ApiProperty } from '@nestjs/swagger';
import { UserType, Status } from '@prisma/client';
import { UserLocationDto } from 'src/modules/user/location/dto/location.dto';

export enum ProfileRolle {
  USER = 'USER',
  SELLER = 'SELLER',
}

export class UserOptionDto {
  @ApiProperty({
    description: 'The user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'The option key',
    example: 'notification_email',
  })
  optionKey: string;

  @ApiProperty({
    description: 'The option value',
    example: 'true',
  })
  optionVal: string;
}

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: UserType })
  type: UserType;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  profileImage: string;

  @ApiProperty({ required: false })
  about?: string;

  @ApiProperty({ required: false })
  birthDate?: Date;

  @ApiProperty({ enum: ProfileRolle })
  role: ProfileRolle;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [UserOptionDto] })
  options: UserOptionDto[];

  @ApiProperty({ type: UserLocationDto })
  location?: UserLocationDto;
}
