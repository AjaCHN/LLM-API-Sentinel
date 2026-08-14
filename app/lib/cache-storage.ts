// app/lib/cache-storage.ts v2.9.0
import { CACHE_EXPIRY } from '../constants';
import { ApiCheckCache } from '../types';
import { logError } from './error-handler';
import { isValidCache, isCacheValid, type CacheEntry } from './cache-validation';

// 缓存版本控制 - 应用更新时自动清除旧缓存
export const CACHE_VERSION = 'v1';
export const CACHE_VERSION_KEY = `apiCheckCache_${CACHE_VERSION}_version`;
export const CACHE_KEY = `apiCheckCache_${CACHE_VERSION}_data`;

/** 读取并校验某个 storage 中的缓存，剔除过期条目 */
function readValidCache(storage: Storage): ApiCheckCache {
  const cache: ApiCheckCache = {};
  try {
    const cached = storage.getItem(CACHE_KEY);
    if (!cached) return cache;
    const parsed = JSON.parse(cached);
    if (!isValidCache(parsed)) {
      storage.removeItem(CACHE_KEY);
      return cache;
    }
    const now = Date.now();
    Object.keys(parsed).forEach((apiId) => {
      if (now - parsed[apiId].timestamp < parsed[apiId].expiry) {
        cache[apiId] = parsed[apiId];
      }
    });
    // 清理过期数据
    if (Object.keys(cache).length !== Object.keys(parsed).length) {
      storage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    logError(error, 'Failed to read cache from storage');
    storage.removeItem(CACHE_KEY);
  }
  return cache;
}

/** 版本不匹配时清除所有旧版本缓存 */
function purgeOldVersion(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('apiCheckCache')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
}

export function loadCacheFromStorage(): ApiCheckCache {
  const cache: ApiCheckCache = {};

  if (typeof localStorage === 'undefined') return cache;

  try {
    const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    if (storedVersion !== CACHE_VERSION) {
      purgeOldVersion();
      return cache;
    }
    const localCache = readValidCache(localStorage);
    Object.assign(cache, localCache);
  } catch (error) {
    logError(error, 'Failed to load cache from localStorage');
  }

  // 会话存储作为备用（仅在本地存储为空时）
  if (typeof sessionStorage !== 'undefined' && Object.keys(cache).length === 0) {
    try {
      Object.assign(cache, readValidCache(sessionStorage));
    } catch (error) {
      logError(error, 'Failed to load cache from sessionStorage');
    }
  }

  return cache;
}

/** 保存完整缓存到存储（localStorage 仅持久化长过期条目，sessionStorage 全量） */
export function saveCacheToStorage(cache: ApiCheckCache): void {
  if (typeof localStorage !== 'undefined') {
    try {
      const persistentCache: ApiCheckCache = {};
      Object.keys(cache).forEach((apiId) => {
        if (cache[apiId].expiry >= CACHE_EXPIRY) {
          persistentCache[apiId] = cache[apiId];
        }
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(persistentCache));
    } catch (error) {
      logError(error, 'Failed to save cache to localStorage');
    }
  }

  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      logError(error, 'Failed to save cache to sessionStorage');
    }
  }
}

/** 增量持久化单条记录，避免每次 setCache 全量重序列化 */
export function persistSingleCache(apiId: string, entry: CacheEntry): void {
  if (typeof sessionStorage !== 'undefined') {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      const parsed: ApiCheckCache = cached ? JSON.parse(cached) : {};
      parsed[apiId] = entry;
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
    } catch (error) {
      logError(error, 'Failed to persist single cache to sessionStorage');
    }
  }

  if (typeof localStorage !== 'undefined' && entry.expiry >= CACHE_EXPIRY) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const parsed: ApiCheckCache = cached ? JSON.parse(cached) : {};
      parsed[apiId] = entry;
      localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
    } catch (error) {
      logError(error, 'Failed to persist single cache to localStorage');
    }
  }
}

/** 清除存储中的完整缓存 */
export function clearStorageCache(): void {
  if (typeof localStorage !== 'undefined') {
    try { localStorage.removeItem(CACHE_KEY); } catch (error) {
      logError(error, 'Failed to clear cache from localStorage');
    }
  }
  if (typeof sessionStorage !== 'undefined') {
    try { sessionStorage.removeItem(CACHE_KEY); } catch (error) {
      logError(error, 'Failed to clear cache from sessionStorage');
    }
  }
}

/** 清除存储中特定 API 的缓存 */
export function clearStorageApiCache(apiId: string): void {
  if (typeof localStorage !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        delete parsed[apiId];
        localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
      }
    } catch (error) {
      logError(error, 'Failed to clear API cache from localStorage');
    }
  }
  if (typeof sessionStorage !== 'undefined') {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        delete parsed[apiId];
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
      }
    } catch (error) {
      logError(error, 'Failed to clear API cache from sessionStorage');
    }
  }
}

export { isCacheValid };
