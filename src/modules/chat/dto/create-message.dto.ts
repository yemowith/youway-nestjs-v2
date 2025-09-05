import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ description: 'Receiver user ID', example: 'uuid-string' })
  @IsUUID()
  receiverId: string;

  @ApiProperty({ description: 'Message content', example: 'Hello!' })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Message type',
    example: 'text',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;
}
