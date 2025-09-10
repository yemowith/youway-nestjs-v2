import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoomsService } from './rooms.service';
import { DatetimeModule } from 'src/helpers/datetime/datetime.module';

@Module({
  providers: [RoomsService],
  exports: [RoomsService],
  imports: [DatetimeModule, ConfigModule],
})
export class RoomsModule {}
