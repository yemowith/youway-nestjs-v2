import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { DatetimeModule } from 'src/helpers/datetime/datetime.module';

@Module({
  providers: [RoomsService],
  exports: [RoomsService],
  imports: [DatetimeModule],
})
export class RoomsModule {}
