import { Module } from '@nestjs/common';

import { RoomsController } from './rooms.controller';
import { RoomsModule as RoomsServiceModule } from 'src/modules/rooms/rooms.module';
@Module({
  providers: [],
  controllers: [RoomsController],
  imports: [RoomsServiceModule],
})
export class RoomsModule {}
