import Redis from 'ioredis';
import { config } from '../config/env';

let redisClient: Redis | null = null;
const memoryCache = new Map<string, { value: string; expiresAt: number }>();

/**
 * Initialize Redis connection if REDIS_URL is provided, with memory cache fallback
 */
export function getRedisClient(): Redis | null {
  if (!redisClient && config.redisUrl) {
    try {
      redisClient = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 1,
        enableReadyCheck: true,
        lazyConnect: true,
      });

      redisClient.on('error', (err) => {
        console.warn('[Redis] Connection warning (using in-memory cache fallback):', err.message);
      });
    } catch (e) {
      console.warn('[Redis] Redis not available, using in-memory cache fallback');
    }
  }
  return redisClient;
}

/**
 * Get cached item (Redis with memory fallback)
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (client && client.status === 'ready') {
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      // fallback to memory
    }
  }

  const item = memoryCache.get(key);
  if (item) {
    if (Date.now() < item.expiresAt) {
      return JSON.parse(item.value);
    }
    memoryCache.delete(key);
  }
  return null;
}

/**
 * Set cached item with TTL in seconds
 */
export async function setCache(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
  const serialized = JSON.stringify(value);
  const client = getRedisClient();

  if (client && client.status === 'ready') {
    try {
      await client.setex(key, ttlSeconds, serialized);
      return;
    } catch (e) {
      // fallback to memory
    }
  }

  memoryCache.set(key, {
    value: serialized,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Distributed rate-limit counter
 */
export async function incrementRateLimit(key: string, windowSeconds: number = 60): Promise<number> {
  const client = getRedisClient();
  if (client && client.status === 'ready') {
    try {
      const count = await client.incr(key);
      if (count === 1) {
        await client.expire(key, windowSeconds);
      }
      return count;
    } catch (e) {
      // fallback
    }
  }

  const cached = await getCache<number>(`rl:${key}`);
  const nextCount = (cached || 0) + 1;
  await setCache(`rl:${key}`, nextCount, windowSeconds);
  return nextCount;
}
