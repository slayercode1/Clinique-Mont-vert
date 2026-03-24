import redis from './redis.js';

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    return cached ? (JSON.parse(cached) as T) : null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttl = 300): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch {
    // Best-effort, ne bloque jamais la requête
  }
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // Best-effort
  }
}
