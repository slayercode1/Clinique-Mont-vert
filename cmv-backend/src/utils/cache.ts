import redis from './redis.js';

/**
 * Get a cached value. Returns null if not found or Redis is unavailable.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    return cached ? (JSON.parse(cached) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Set a cache entry with a TTL in seconds.
 */
export async function setCache(key: string, value: unknown, ttl = 300): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch {
    // Cache is best-effort — never block the request
  }
}

/**
 * Delete one or more cache keys.
 */
export async function invalidateCache(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // Ignore
  }
}
