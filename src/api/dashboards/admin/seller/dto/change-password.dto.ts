import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}
