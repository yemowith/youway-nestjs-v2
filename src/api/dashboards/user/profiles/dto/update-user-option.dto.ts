import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserOptionDto {
  @ApiProperty({
    description: 'The key of the user option to update',
    example: 'notification_email',
  })
  @IsNotEmpty()
  @IsString()
  optionKey: string;

  @ApiProperty({
    description: 'The value to set for the user option',
    example: 'true',
  })
  @IsNotEmpty()
  @IsString()
  optionValue: string;
}
