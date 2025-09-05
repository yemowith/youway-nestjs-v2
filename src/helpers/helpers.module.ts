import { Module } from '@nestjs/common'
import { DatetimeModule } from './datetime/datetime.module'

@Module({
  imports: [DatetimeModule],
  exports: [DatetimeModule],
})
export class HelpersModule {}
