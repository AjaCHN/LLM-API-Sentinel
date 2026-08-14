// app/lib/cache-validation.ts v2.9.0
import { CACHE_EXPIRY, MIN_CACHE_EXPIRY, MAX_CACHE_EXPIRY } from '../constants';
import { ApiCheckResult, ApiCheckCache } from '../types';

/** 缓存条目结构（与内存/存储一致） */
export interface CacheEntry {
  result: ApiCheckResult;
  timestamp: number;
  expiry: number;
}

export function isValidCacheEntry(entry: unknown): entry is CacheEntry {
  if (!entry || typeof entry !== 'object') return false;
  const obj = entry as Record<string, unknown>;
  if (!obj.result || typeof obj.result !== 'object') return false;
  if (typeof obj.timestamp !== 'number') return false;
  if (typeof obj.expiry !== 'number') return false;
  return true;
}

export function isValidCache(data: unknown): data is ApiCheckCache {
  if (!data || typeof data !== 'object') return false;
  const cache = data as Record<string, unknown>;
  for (const key of Object.keys(cache)) {
    if (!isValidCacheEntry(cache[key])) return false;
  }
  return true;
}

/** 根据 API 特性计算缓存过期时间 */
export function calculateCacheExpiry(apiId: string, status: string, latency: number): number {
  let baseExpiry = CACHE_EXPIRY;

  if (status === 'offline') {
    baseExpiry = MIN_CACHE_EXPIRY;
  } else if (status === 'online') {
    if (latency < 100) {
      baseExpiry = Math.min(MAX_CACHE_EXPIRY, baseExpiry * 2);
    } else if (latency > 1000) {
      baseExpiry = Math.max(MIN_CACHE_EXPIRY, baseExpiry / 2);
    }
  }

  return baseExpiry;
}

/** 检查缓存条目是否仍在有效期内 */
export function isCacheValid(cacheEntry: { timestamp: number; expiry: number }): boolean {
  return Date.now() - cacheEntry.timestamp < cacheEntry.expiry;
}
