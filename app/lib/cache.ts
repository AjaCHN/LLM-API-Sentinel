// app/lib/cache.ts v2.8.2
import { CACHE_EXPIRY, MIN_CACHE_EXPIRY, MAX_CACHE_EXPIRY } from '../constants';
import { ApiCheckResult, ApiCheckCache } from '../types';
import { logError } from './error-handler';

// 缓存版本控制 - 应用更新时自动清除旧缓存
const CACHE_VERSION = 'v1';
const CACHE_VERSION_KEY = `apiCheckCache_${CACHE_VERSION}_version`;
const CACHE_KEY = `apiCheckCache_${CACHE_VERSION}_data`;

let memoryCache: ApiCheckCache = {};
let storageLoaded = false;

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
  
  if (typeof localStorage === 'undefined') return cache;
  
  try {
    // 检查缓存版本，版本不匹配时清除旧缓存
    const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    if (storedVersion !== CACHE_VERSION) {
      // 清除所有旧版本缓存
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('apiCheckCache')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
      return cache;
    }
    
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (!isValidCache(parsed)) {
        localStorage.removeItem(CACHE_KEY);
        return cache;
      }
      const now = Date.now();
      Object.keys(parsed).forEach(apiId => {
        if (now - parsed[apiId].timestamp < parsed[apiId].expiry) {
          cache[apiId] = parsed[apiId];
        }
      });
      // 清理过期数据
      if (Object.keys(cache).length !== Object.keys(parsed).length) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      }
    }
  } catch (error) {
    logError(error, 'Failed to load cache from localStorage');
    localStorage.removeItem(CACHE_KEY);
  }
  
  // 会话存储作为备用（不再每次读取）
  if (typeof sessionStorage !== 'undefined') {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached && Object.keys(cache).length === 0) {
        const parsed = JSON.parse(cached);
        if (isValidCache(parsed)) {
          const now = Date.now();
          Object.keys(parsed).forEach(apiId => {
            if (now - parsed[apiId].timestamp < parsed[apiId].expiry) {
              cache[apiId] = parsed[apiId];
            }
          });
        }
      }
    } catch (error) {
      logError(error, 'Failed to load cache from sessionStorage');
    }
  }
  
  return cache;
}

// 保存缓存到存储
// 性能优化: 仅在确有变化时才序列化写入，避免 setCache 每次都全量 JSON.stringify 阻塞主线程
export function saveCacheToStorage(cache: ApiCheckCache) {
  // 保存到本地存储（持久数据）
  if (typeof localStorage !== 'undefined') {
    try {
      const persistentCache: ApiCheckCache = {};
      Object.keys(cache).forEach(apiId => {
        // 只保存过期时间较长的缓存
        if (cache[apiId].expiry >= CACHE_EXPIRY) {
          persistentCache[apiId] = cache[apiId];
        }
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(persistentCache));
    } catch (error) {
      logError(error, 'Failed to save cache to localStorage');
    }
  }
  
  // 保存到会话存储（临时数据）
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      logError(error, 'Failed to save cache to sessionStorage');
    }
  }
}

// 仅将单个 API 的最新结果写入存储，避免每次 setCache 全量重序列化整个缓存
export function persistSingleCache(apiId: string, entry: ApiCheckCache[string]): void {
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

// 根据 API 特性计算缓存过期时间
export function calculateCacheExpiry(apiId: string, status: string, latency: number): number {
  // 基础过期时间
  let baseExpiry = CACHE_EXPIRY;
  
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
  
  return baseExpiry;
}

// 检查缓存是否有效
export function isCacheValid(cacheEntry: { timestamp: number; expiry: number }): boolean {
  return Date.now() - cacheEntry.timestamp < cacheEntry.expiry;
}

// 获取缓存 - 性能优化：只在初始化时加载 storage，后续只读内存缓存
export function getCache(apiId: string): ApiCheckResult | null {
  // 首先检查内存缓存
  const cached = memoryCache[apiId];
  if (cached && isCacheValid(cached)) {
    return cached.result;
  }
  
  // 内存缓存无效，标记需要刷新
  if (!storageLoaded) {
    const storageCache = loadCacheFromStorage();
    memoryCache = { ...memoryCache, ...storageCache };
    storageLoaded = true;
    
    // 再次检查
    const refreshed = memoryCache[apiId];
    if (refreshed && isCacheValid(refreshed)) {
      return refreshed.result;
    }
  }
  
  return null;
}

// 设置缓存
export function setCache(apiId: string, result: ApiCheckResult): void {
  // 计算缓存过期时间
  const expiry = calculateCacheExpiry(apiId, result.status, result.latency);

  const entry = {
    result,
    timestamp: Date.now(),
    expiry
  };

  memoryCache[apiId] = entry;

  // 性能优化: 增量持久化单条记录，避免每次写入都全量序列化整个缓存
  persistSingleCache(apiId, entry);
}

// 清除缓存
export function clearCache(): void {
  memoryCache = {};
  storageLoaded = false;
  
  // 清除本地存储
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      logError(error, 'Failed to clear cache from localStorage');
    }
  }
  
  // 清除会话存储
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch (error) {
      logError(error, 'Failed to clear cache from sessionStorage');
    }
  }
}

// 清除特定 API 的缓存
export function clearApiCache(apiId: string): void {
  delete memoryCache[apiId];
  
  // 清除本地存储中的特定 API 缓存
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
  
  // 清除会话存储中的特定 API 缓存
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
  const apisToPrewarm = apiIds.length > 0 
    ? apiIds 
    : Object.keys(memoryCache);
  
  apisToPrewarm.forEach(apiId => {
    const cached = memoryCache[apiId];
    if (cached && !isCacheValid(cached)) {
      delete memoryCache[apiId];
    }
  });
}

