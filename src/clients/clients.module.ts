import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { SupabaseModule } from './supabase/supabase.module';
import { RedisdbModule } from './redisdb/redisdb.module';

@Global()
@Module({
  providers: [],
  exports: [PrismaModule, CacheModule, SupabaseModule],
  imports: [PrismaModule, CacheModule, SupabaseModule, RedisdbModule],
})
export class ClientsModule {}
