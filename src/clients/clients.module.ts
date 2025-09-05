import { Global, Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { CacheModule } from './cache/cache.module'
import { SupabaseModule } from './supabase/supabase.module'

@Global()
@Module({
  providers: [],
  exports: [PrismaModule, CacheModule, SupabaseModule],
  imports: [PrismaModule, CacheModule, SupabaseModule],
})
export class ClientsModule {}
