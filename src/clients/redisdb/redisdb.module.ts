import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisdbService } from './redisdb.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisdbService],
  exports: [RedisdbService],
})
export class RedisdbModule {}
