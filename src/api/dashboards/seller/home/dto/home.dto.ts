import { ApiProperty } from '@nestjs/swagger'

export class Sellerto {
  @ApiProperty({ description: 'User ID' })
  id: string

  @ApiProperty({ description: 'User first name' })
  firstName: string

  @ApiProperty({ description: 'User last name' })
  lastName: string

  @ApiProperty({ description: 'User profile image', required: false })
  profileImage?: string
}
