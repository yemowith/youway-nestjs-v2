import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisdbService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;
  private readonly globalPrefix: string;

  constructor(private readonly configService: ConfigService) {
    const redisConfig = this.configService.get('redis');
    this.globalPrefix = redisConfig?.prefix || 'youway:';

    this.redis = new Redis({
      host: redisConfig?.host || 'localhost',
      port: redisConfig?.port || 6379,
      password: redisConfig?.password || undefined,
      db: redisConfig?.db || 0,
    });

    this.redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });
  }

  async onModuleInit() {
    // Connection is already established in constructor
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  /**
   * Generate a full key with global prefix
   * @param key - The key to prefix
   * @returns Full key with global prefix
   */
  private withPrefix(key: string): string {
    return `${this.globalPrefix}${key}`;
  }

  /**
   * Set a key-value pair with expiration
   * @param key - The key
   * @param value - The value to store
   * @param expire - Time to live in seconds or Date object
   * @returns Promise<void>
   */
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

  /**
   * Get a value by key
   * @param key - The key
   * @returns Promise<T | null>
   */
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

  /**
   * Delete a key
   * @param key - The key to delete
   * @returns Promise<void>
   */
  async del(key: string): Promise<void> {
    const redisKey = this.withPrefix(key);
    await this.redis.del(redisKey);
  }

  /**
   * Check if a key exists
   * @param key - The key to check
   * @returns Promise<boolean>
   */
  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.withPrefix(key);
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  /**
   * Set expiration time for a key
   * @param key - The key
   * @param ttl - Time to live in seconds
   * @returns Promise<boolean>
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const fullKey = this.withPrefix(key);
      const result = await this.redis.expire(fullKey, ttl);
      return result === 1;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  /**
   * Get time to live for a key
   * @param key - The key
   * @returns Promise<number> - TTL in seconds, -1 if no expiration, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    try {
      const fullKey = this.withPrefix(key);
      return await this.redis.ttl(fullKey);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -2;
    }
  }

  /**
   * Increment a numeric value
   * @param key - The key
   * @param increment - Amount to increment (default: 1)
   * @returns Promise<number> - New value after increment
   */
  async incr(key: string, increment: number = 1): Promise<number> {
    try {
      const fullKey = this.withPrefix(key);
      return await this.redis.incrby(fullKey, increment);
    } catch (error) {
      console.error('Redis INCR error:', error);
      return 0;
    }
  }

  /**
   * Decrement a numeric value
   * @param key - The key
   * @param decrement - Amount to decrement (default: 1)
   * @returns Promise<number> - New value after decrement
   */
  async decr(key: string, decrement: number = 1): Promise<number> {
    try {
      const fullKey = this.withPrefix(key);
      return await this.redis.decrby(fullKey, decrement);
    } catch (error) {
      console.error('Redis DECR error:', error);
      return 0;
    }
  }

  /**
   * Get all keys matching a pattern
   * @param pattern - Pattern to match (without global prefix)
   * @returns Promise<string[]> - Array of matching keys
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      const fullPattern = this.withPrefix(pattern);
      return await this.redis.keys(fullPattern);
    } catch (error) {
      console.error('Redis KEYS error:', error);
      return [];
    }
  }

  /**
   * Delete all keys matching a pattern
   * @param pattern - Pattern to match (without global prefix)
   * @returns Promise<number> - Number of keys deleted
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const fullPattern = this.withPrefix(pattern);
      const keys = await this.redis.keys(fullPattern);

      if (keys.length === 0) {
        return 0;
      }

      return await this.redis.del(...keys);
    } catch (error) {
      console.error('Redis DEL PATTERN error:', error);
      return 0;
    }
  }

  /**
   * Set a key only if it doesn't exist (atomic operation)
   * @param key - The key
   * @param value - The value to store
   * @param ttl - Time to live in seconds (optional)
   * @returns Promise<boolean> - True if key was set, false if key already exists
   */
  async setnx(
    key: string,
    value: string | number | object,
    ttl?: number,
  ): Promise<boolean> {
    try {
      const fullKey = this.withPrefix(key);
      const stringValue =
        typeof value === 'object' ? JSON.stringify(value) : String(value);

      if (ttl) {
        const result = await this.redis.set(
          fullKey,
          stringValue,
          'EX',
          ttl,
          'NX',
        );
        return result === 'OK';
      } else {
        const result = await this.redis.set(fullKey, stringValue, 'NX');
        return result === 'OK';
      }
    } catch (error) {
      console.error('Redis SETNX error:', error);
      return false;
    }
  }

  /**
   * Get multiple keys at once
   * @param keys - Array of keys
   * @returns Promise<(string | null)[]> - Array of values
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      const fullKeys = keys.map((key) => this.withPrefix(key));
      return await this.redis.mget(...fullKeys);
    } catch (error) {
      console.error('Redis MGET error:', error);
      return [];
    }
  }

  /**
   * Set multiple key-value pairs at once
   * @param keyValuePairs - Object with key-value pairs
   * @returns Promise<boolean>
   */
  async mset(
    keyValuePairs: Record<string, string | number | object>,
  ): Promise<boolean> {
    try {
      const fullKeyValuePairs: string[] = [];

      for (const [key, value] of Object.entries(keyValuePairs)) {
        const fullKey = this.withPrefix(key);
        const stringValue =
          typeof value === 'object' ? JSON.stringify(value) : String(value);
        fullKeyValuePairs.push(fullKey, stringValue);
      }

      await this.redis.mset(...fullKeyValuePairs);
      return true;
    } catch (error) {
      console.error('Redis MSET error:', error);
      return false;
    }
  }

  /**
   * Get the global prefix being used
   * @returns string - The global prefix
   */
  getGlobalPrefix(): string {
    return this.globalPrefix;
  }

  /**
   * Get raw Redis instance for advanced operations
   * @returns Redis - The Redis instance
   */
  getRedisInstance(): Redis {
    return this.redis;
  }
}
