import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly prefix: string = 'cache:';

  constructor(private readonly configService: ConfigService) {
    const redisConfig = this.configService.get('redis');
    this.prefix = redisConfig?.prefix || 'cache:';
    this.redis = new Redis({
      host: redisConfig?.host || 'localhost',
      port: redisConfig?.port || 6379,
      password: redisConfig?.password || undefined,
      db: redisConfig?.db || 0,
    });
  }

  private withPrefix(key: string): string {
    return `${this.prefix}${key}`;
  }

  async set(key: string, value: any, expire: number | Date): Promise<void> {
    let storeValue: any = value;
    let ttl: number;
    if (expire instanceof Date) {
      const seconds = Math.max(
        1,
        Math.floor((expire.getTime() - Date.now()) / 1000),
      );
      storeValue = { value, _expire: expire.getTime() };
      ttl = seconds;
    } else {
      ttl = expire;
    }
    const stringValue = JSON.stringify(storeValue);
    const redisKey = this.withPrefix(key);
    await this.redis.set(redisKey, stringValue, 'EX', ttl);
  }

  async get<T = any>(key: string): Promise<T | null> {
    const redisKey = this.withPrefix(key);
    const val = await this.redis.get(redisKey);
    if (val === null) return null;
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === 'object' && '_expire' in parsed) {
        if (typeof parsed._expire === 'number' && parsed._expire < Date.now()) {
          // Expired, remove from cache
          await this.redis.del(redisKey);
          return null;
        }
        return parsed.value as T;
      }
      return parsed as T;
    } catch {
      return null;
    }
  }

  async del(key: string): Promise<void> {
    const redisKey = this.withPrefix(key);
    await this.redis.del(redisKey);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
