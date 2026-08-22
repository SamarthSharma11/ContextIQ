import type { Store, Options, IncrementResponse, ClientRateLimitInfo } from 'express-rate-limit';
import { incrementRateLimit, getCache, setCache, getRedisClient } from './redis';

/**
 * RedisRateLimitStore — a custom express-rate-limit Store backed by Redis,
 * with automatic in-memory fallback when REDIS_URL is not configured.
 *
 * This makes rate limiting work correctly across Railway horizontal replicas:
 * every instance shares the same Redis counter, so the cap is a true global
 * limit — not per-instance.
 *
 * Implements the express-rate-limit v7 Store interface.
 */
export class RedisRateLimitStore implements Store {
  public prefix: string;
  public localKeys: boolean = false; // Shared across instances
  public windowMs: number;

  constructor(options?: { prefix?: string; windowMs?: number }) {
    this.prefix = options?.prefix ?? 'rl:global:';
    this.windowMs = options?.windowMs ?? 15 * 60 * 1000;
  }

  init(options: Options): void {
    if (options.windowMs) {
      this.windowMs = options.windowMs;
    }
  }

  private key(identifier: string): string {
    return `${this.prefix}${identifier}`;
  }

  private get windowSeconds(): number {
    return Math.ceil(this.windowMs / 1000);
  }

  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    const storeKey = this.key(key);
    const count = await getCache<number>(`rl:${storeKey}`);
    if (count === null || count === undefined) {
      return undefined;
    }
    return {
      totalHits: count,
      resetTime: new Date(Date.now() + this.windowMs),
    };
  }

  async increment(key: string): Promise<IncrementResponse> {
    const storeKey = this.key(key);
    const count = await incrementRateLimit(storeKey, this.windowSeconds);

    // Read the remaining TTL from Redis if available, else use window
    let resetTimeMs = Date.now() + this.windowMs;
    const client = getRedisClient();
    if (client && client.status === 'ready') {
      try {
        const ttl = await client.ttl(storeKey);
        if (ttl > 0) {
          resetTimeMs = Date.now() + ttl * 1000;
        }
      } catch {
        // use default
      }
    }

    return {
      totalHits: count,
      resetTime: new Date(resetTimeMs),
    };
  }

  async decrement(key: string): Promise<void> {
    const storeKey = this.key(key);
    const client = getRedisClient();
    if (client && client.status === 'ready') {
      try {
        await client.decr(storeKey);
        return;
      } catch {
        // fallback to memory
      }
    }
    const cached = await getCache<number>(`rl:${storeKey}`);
    if (cached && cached > 0) {
      await setCache(`rl:${storeKey}`, cached - 1, this.windowSeconds);
    }
  }

  async resetKey(key: string): Promise<void> {
    const storeKey = this.key(key);
    const client = getRedisClient();
    if (client && client.status === 'ready') {
      try {
        await client.del(storeKey);
        return;
      } catch {
        // fallback
      }
    }
    await setCache(`rl:${storeKey}`, 0, this.windowSeconds);
  }

  async resetAll(): Promise<void> {
    // In distributed store, key expiration handles overall resets
  }
}
