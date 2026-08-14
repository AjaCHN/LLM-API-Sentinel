// app/lib/cache.ts v2.9.0
import { ApiCheckResult, ApiCheckCache } from '../types';
import {
  loadCacheFromStorage, persistSingleCache,
  clearStorageCache, clearStorageApiCache,
} from './cache-storage';
import {
  calculateCacheExpiry, isCacheValid, isValidCache, type CacheEntry,
} from './cache-validation';

let memoryCache: ApiCheckCache = {};
let storageLoaded = false;

// 获取缓存 - 性能优化：只在首次缺失时加载 storage，后续只读内存缓存
export function getCache(apiId: string): ApiCheckResult | null {
  const cached = memoryCache[apiId];
  if (cached && isCacheValid(cached)) {
    return cached.result;
  }

  if (!storageLoaded) {
    const storageCache = loadCacheFromStorage();
    memoryCache = { ...memoryCache, ...storageCache };
    storageLoaded = true;

    const refreshed = memoryCache[apiId];
    if (refreshed && isCacheValid(refreshed)) {
      return refreshed.result;
    }
  }

  return null;
}

// 设置缓存（增量持久化单条记录）
export function setCache(apiId: string, result: ApiCheckResult): void {
  const expiry = calculateCacheExpiry(apiId, result.status, result.latency);
  const entry: CacheEntry = { result, timestamp: Date.now(), expiry };
  memoryCache[apiId] = entry;
  persistSingleCache(apiId, entry);
}

export function clearCache(): void {
  memoryCache = {};
  storageLoaded = false;
  clearStorageCache();
}

export function clearApiCache(apiId: string): void {
  delete memoryCache[apiId];
  clearStorageApiCache(apiId);
}

export function initializeCache(): void {
  memoryCache = loadCacheFromStorage();
}

export function getCurrentCache(): ApiCheckCache {
  return memoryCache;
}

// 预热缓存 - 预先清理无效条目
export function prewarmCache(apiIds: string[]): void {
  const apisToPrewarm = apiIds.length > 0 ? apiIds : Object.keys(memoryCache);
  apisToPrewarm.forEach((apiId) => {
    const cached = memoryCache[apiId];
    if (cached && !isCacheValid(cached)) {
      delete memoryCache[apiId];
    }
  });
}

export { isValidCache, isCacheValid };
