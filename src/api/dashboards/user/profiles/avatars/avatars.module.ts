import { Module } from '@nestjs/common'
import { AvatarsController } from './avatars.controller'
import { AvatarsService } from 'src/modules/user/avatar/avatars.service'
import { JwtService } from '@nestjs/jwt'

@Module({
  controllers: [AvatarsController],
  providers: [AvatarsService, JwtService],
  exports: [AvatarsService],
})
export class AvatarsModule {}
