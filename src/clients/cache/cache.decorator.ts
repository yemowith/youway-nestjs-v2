import { SetMetadata } from '@nestjs/common';

export interface CacheableOptions {
  key: string | ((...args: any[]) => string);
  expire: number | Date | ((...args: any[]) => number | Date);
}

// Utility to get expire date from string like '1m', '5m', '1h', '2d', etc.
export function expireIn(duration: string): Date {
  const now = Date.now();
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error('Invalid duration format');
  const value = parseInt(match[1], 10);
  const unit = match[2];
  let ms = 0;
  switch (unit) {
    case 's':
      ms = value * 1000;
      break;
    case 'm':
      ms = value * 60 * 1000;
      break;
    case 'h':
      ms = value * 60 * 60 * 1000;
      break;
    case 'd':
      ms = value * 24 * 60 * 60 * 1000;
      break;
    default:
      throw new Error('Invalid duration unit');
  }
  return new Date(now + ms);
}

export function Cacheable(options: CacheableOptions): MethodDecorator {
  return function (target, propertyKey, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const cacheService = this.cacheService;

      if (!cacheService) {
        throw new Error('CacheService not found on class instance.');
      }
      const key =
        typeof options.key === 'function' ? options.key(...args) : options.key;
      const expire =
        typeof options.expire === 'function'
          ? options.expire(...args)
          : options.expire;

      const cached = await cacheService.get(key);
      if (cached !== null && cached !== undefined) {
        return cached;
      }

      // Call original
      const result = await originalMethod.apply(this, args);
      await cacheService.set(key, result, expire);
      return result;
    };
    SetMetadata('cacheable', options)(descriptor.value);
    return descriptor;
  };
}
