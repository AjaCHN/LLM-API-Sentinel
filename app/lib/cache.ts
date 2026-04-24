// app/lib/cache.ts v2.5.0
import { CACHE_EXPIRY, DEFAULT_CACHE_EXPIRY, MIN_CACHE_EXPIRY, MAX_CACHE_EXPIRY } from '../constants';
import { ApiCheckResult, ApiCheckCache } from '../types';

// 内存缓存
let memoryCache: ApiCheckCache = {};

// 从本地存储加载缓存
export function loadCacheFromStorage(): ApiCheckCache {
  const cache: ApiCheckCache = {};
  
  // 从本地存储加载
  if (typeof localStorage !== 'undefined') {
    try {
      const cached = localStorage.getItem('apiCheckCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        Object.keys(parsed).forEach(apiId => {
          if (now - parsed[apiId].timestamp < parsed[apiId].expiry) {
            cache[apiId] = parsed[apiId];
          }
        });
        // 保存清理后的缓存
        localStorage.setItem('apiCheckCache', JSON.stringify(cache));
      }
    } catch (error) {
      console.error('Failed to load cache from localStorage:', error);
    }
  }
  
  // 从会话存储加载（临时数据）
  if (typeof sessionStorage !== 'undefined') {
    try {
      const cached = sessionStorage.getItem('apiCheckCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        Object.keys(parsed).forEach(apiId => {
          if (!cache[apiId] && now - parsed[apiId].timestamp < parsed[apiId].expiry) {
            cache[apiId] = parsed[apiId];
          }
        });
      }
    } catch (error) {
      console.error('Failed to load cache from sessionStorage:', error);
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
    // 离线状态缓存时间较短
    baseExpiry = MIN_CACHE_EXPIRY;
  } else if (status === 'online') {
    // 根据延迟调整
    if (latency < 100) {
      // 响应快的 API 可以缓存更长时间
      baseExpiry = Math.min(MAX_CACHE_EXPIRY, baseExpiry * 2);
    } else if (latency > 1000) {
      // 响应慢的 API 缓存时间较短
      baseExpiry = Math.max(MIN_CACHE_EXPIRY, baseExpiry / 2);
    }
  }
  
  // 根据 API ID 调整（可以为特定 API 设置不同的缓存策略）
  const apiSpecificExpiry = getApiSpecificExpiry(apiId);
  if (apiSpecificExpiry) {
    return apiSpecificExpiry;
  }
  
  return baseExpiry;
}

// 获取特定 API 的缓存过期时间
export function getApiSpecificExpiry(apiId: string): number | null {
  // 这里可以为特定 API 设置不同的缓存策略
  const apiExpiryMap: { [apiId: string]: number } = {
    // 示例：为特定 API 设置不同的缓存时间
    // 'openai': 60000, // 1分钟
    // 'anthropic': 30000, // 30秒
  };
  
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

// 预热缓存
export function prewarmCache(apiIds: string[]): void {
  // 可以在这里实现缓存预热逻辑
  // 例如，预加载常用 API 的缓存
  console.log('Prewarming cache for APIs:', apiIds);
}

