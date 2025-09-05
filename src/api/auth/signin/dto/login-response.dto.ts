import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { SessionDto, UserDto } from '../../dto/session-response.dto';
import { Expose, Type } from 'class-transformer';
import { ProfileResponseDto } from 'src/api/dashboards/user/profiles/dto/profile.dto';

export class LoginResponseDto {
  @ApiProperty({ type: SessionDto })
  @Expose()
  @Type(() => SessionDto)
  session: SessionDto;

  @ApiProperty({ type: UserDto })
  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @ApiProperty({ type: ProfileResponseDto })
  @Expose()
  @Type(() => ProfileResponseDto)
  profile: ProfileResponseDto;
}
