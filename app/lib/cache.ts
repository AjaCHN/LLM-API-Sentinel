// app/lib/cache.ts v2.6.3
import { DEFAULT_CACHE_EXPIRY, MIN_CACHE_EXPIRY, MAX_CACHE_EXPIRY } from '../constants';
import { ApiCheckResult, ApiCheckCache } from '../types';

let memoryCache: ApiCheckCache = {};

function isValidCacheEntry(entry: unknown): entry is { result: ApiCheckResult; timestamp: number; expiry: number } {
  if (!entry || typeof entry !== 'object') return false;
  const obj = entry as Record<string, unknown>;
  if (!obj.result || typeof obj.result !== 'object') return false;
  if (typeof obj.timestamp !== 'number') return false;
  if (typeof obj.expiry !== 'number') return false;
  return true;
}

function isValidCache(data: unknown): data is ApiCheckCache {
  if (!data || typeof data !== 'object') return false;
  const cache = data as Record<string, unknown>;
  for (const key of Object.keys(cache)) {
    if (!isValidCacheEntry(cache[key])) {
      return false;
    }
  }
  return true;
}

export function loadCacheFromStorage(): ApiCheckCache {
  const cache: ApiCheckCache = {};
  
  // 从本地存储加载
  if (typeof localStorage !== 'undefined') {
    try {
      const cached = localStorage.getItem('apiCheckCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!isValidCache(parsed)) {
          localStorage.removeItem('apiCheckCache');
          return cache;
        }
        const now = Date.now();
        Object.keys(parsed).forEach(apiId => {
          if (now - parsed[apiId].timestamp < parsed[apiId].expiry) {
            cache[apiId] = parsed[apiId];
          }
        });
        localStorage.setItem('apiCheckCache', JSON.stringify(cache));
      }
    } catch (error) {
      console.error('Failed to load cache from localStorage:', error);
      localStorage.removeItem('apiCheckCache');
    }
  }
  
  if (typeof sessionStorage !== 'undefined') {
    try {
      const cached = sessionStorage.getItem('apiCheckCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!isValidCache(parsed)) {
          sessionStorage.removeItem('apiCheckCache');
          return cache;
        }
        const now = Date.now();
        Object.keys(parsed).forEach(apiId => {
          if (!cache[apiId] && now - parsed[apiId].timestamp < parsed[apiId].expiry) {
            cache[apiId] = parsed[apiId];
          }
        });
      }
    } catch (error) {
      console.error('Failed to load cache from sessionStorage:', error);
      sessionStorage.removeItem('apiCheckCache');
    }
  }
  
  return cache;
}

// 保存缓存到存储
export function saveCacheToStorage(cache: ApiCheckCache) {
  // 保存到本地存储（持久数据）
  if (typeof localStorage !== 'undefined') {
    try {
      // 只保存重要的缓存数据
      const persistentCache: ApiCheckCache = {};
      Object.keys(cache).forEach(apiId => {
        // 只保存过期时间较长的缓存
        if (cache[apiId].expiry >= DEFAULT_CACHE_EXPIRY) {
          persistentCache[apiId] = cache[apiId];
        }
      });
      localStorage.setItem('apiCheckCache', JSON.stringify(persistentCache));
    } catch (error) {
      console.error('Failed to save cache to localStorage:', error);
    }
  }
  
  // 保存到会话存储（临时数据）
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem('apiCheckCache', JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to save cache to sessionStorage:', error);
    }
  }
}

// 根据 API 特性计算缓存过期时间
export function calculateCacheExpiry(apiId: string, status: string, latency: number): number {
  // 基础过期时间
  let baseExpiry = DEFAULT_CACHE_EXPIRY;
  
  // 根据状态调整
  if (status === 'offline') {
    baseExpiry = MIN_CACHE_EXPIRY;
  } else if (status === 'online') {
    if (latency < 100) {
      baseExpiry = Math.min(MAX_CACHE_EXPIRY, baseExpiry * 2);
    } else if (latency > 1000) {
      baseExpiry = Math.max(MIN_CACHE_EXPIRY, baseExpiry / 2);
    }
  }
  
  const apiSpecificExpiry = getApiSpecificExpiry(apiId);
  if (apiSpecificExpiry) {
    return apiSpecificExpiry;
  }
  
  return baseExpiry;
}

// 获取特定 API 的缓存过期时间
export function getApiSpecificExpiry(apiId: string): number | null {
  const apiExpiryMap: Record<string, number> = {};
  
  return apiExpiryMap[apiId] || null;
}

// 检查缓存是否有效
export function isCacheValid(cacheEntry: { timestamp: number; expiry: number }): boolean {
  return Date.now() - cacheEntry.timestamp < cacheEntry.expiry;
}

// 获取缓存
export function getCache(apiId: string): ApiCheckResult | null {
  // 首先检查内存缓存
  const cached = memoryCache[apiId];
  if (cached && isCacheValid(cached)) {
    return cached.result;
  }
  
  // 内存缓存无效，尝试从存储加载
  const storageCache = loadCacheFromStorage();
  const storageCached = storageCache[apiId];
  if (storageCached && isCacheValid(storageCached)) {
    // 更新内存缓存
    memoryCache[apiId] = storageCached;
    return storageCached.result;
  }
  
  return null;
}

// 设置缓存
export function setCache(apiId: string, result: ApiCheckResult): void {
  // 计算缓存过期时间
  const expiry = calculateCacheExpiry(apiId, result.status, result.latency);
  
  memoryCache[apiId] = {
    result,
    timestamp: Date.now(),
    expiry
  };
  
  saveCacheToStorage(memoryCache);
}

// 清除缓存
export function clearCache(): void {
  memoryCache = {};
  
  // 清除本地存储
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('apiCheckCache');
    } catch (error) {
      console.error('Failed to clear cache from localStorage:', error);
    }
  }
  
  // 清除会话存储
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem('apiCheckCache');
    } catch (error) {
      console.error('Failed to clear cache from sessionStorage:', error);
    }
  }
}

// 清除特定 API 的缓存
export function clearApiCache(apiId: string): void {
  delete memoryCache[apiId];
  
  // 清除本地存储中的特定 API 缓存
  if (typeof localStorage !== 'undefined') {
    try {
      const cached = localStorage.getItem('apiCheckCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        delete parsed[apiId];
        localStorage.setItem('apiCheckCache', JSON.stringify(parsed));
      }
    } catch (error) {
      console.error('Failed to clear API cache from localStorage:', error);
    }
  }
  
  // 清除会话存储中的特定 API 缓存
  if (typeof sessionStorage !== 'undefined') {
    try {
      const cached = sessionStorage.getItem('apiCheckCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        delete parsed[apiId];
        sessionStorage.setItem('apiCheckCache', JSON.stringify(parsed));
      }
    } catch (error) {
      console.error('Failed to clear API cache from sessionStorage:', error);
    }
  }
}

// 初始化缓存
export function initializeCache(): void {
  memoryCache = loadCacheFromStorage();
}

// 获取当前缓存
export function getCurrentCache(): ApiCheckCache {
  return memoryCache;
}

// 预热缓存 - 预先加载指定 API 的缓存数据
export function prewarmCache(apiIds: string[]): void {
  console.log('Prewarming cache for APIs:', apiIds);
  
  const apisToPrewarm = apiIds.length > 0 
    ? apiIds 
    : Object.keys(memoryCache);
  
  apisToPrewarm.forEach(apiId => {
    const cached = memoryCache[apiId];
    if (cached && !isCacheValid(cached)) {
      delete memoryCache[apiId];
    }
  });
  
  console.log('Cache prewarm completed. APIs in cache:', Object.keys(memoryCache).length);
}

