import { Module } from '@nestjs/common';
import { GlobalService } from './global.service';
import { GlobalController } from './global.controller';
import { CacheService } from 'src/clients/cache/cache.service';

@Module({
  providers: [GlobalService, CacheService],
  controllers: [GlobalController],
  exports: [GlobalService],
})
export class GlobalModule {}
