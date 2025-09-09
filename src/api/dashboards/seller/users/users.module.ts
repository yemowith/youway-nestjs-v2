import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AvatarsModule } from '../../user/profiles/avatars/avatars.module';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [AvatarsModule],
})
export class UsersModule {}
