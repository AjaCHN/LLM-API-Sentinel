// app/lib/monitor.ts v2.5.0
import { APIS_TO_CHECK, LATENCY_THRESHOLD, MAX_RETRIES, RETRY_DELAY, MAX_CONCURRENT_REQUESTS, CACHE_EXPIRY } from '../constants';
import { ApiCheckResult } from '../types';

// 缓存接口
interface ApiCheckCache {
  [apiId: string]: {
    result: ApiCheckResult;
    timestamp: number;
  };
}

// 内存缓存
let memoryCache: ApiCheckCache = {};

// 从本地存储加载缓存
function loadCacheFromStorage(): ApiCheckCache {
  if (typeof localStorage === 'undefined') return {};
  try {
    const cached = localStorage.getItem('apiCheckCache');
    if (cached) {
      const parsed = JSON.parse(cached);
      // 清理过期缓存
      const now = Date.now();
      Object.keys(parsed).forEach(apiId => {
        if (now - parsed[apiId].timestamp > CACHE_EXPIRY) {
          delete parsed[apiId];
        }
      });
      // 保存清理后的缓存
      localStorage.setItem('apiCheckCache', JSON.stringify(parsed));
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load cache:', error);
  }
  return {};
}

// 保存缓存到本地存储
function saveCacheToStorage() {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem('apiCheckCache', JSON.stringify(memoryCache));
  } catch (error) {
    console.error('Failed to save cache:', error);
  }
}

// 初始化缓存
memoryCache = loadCacheFromStorage();

// 检查缓存是否有效
function isCacheValid(cacheEntry: { timestamp: number }): boolean {
  return Date.now() - cacheEntry.timestamp < CACHE_EXPIRY;
}

async function checkApi(api: typeof APIS_TO_CHECK[0], retries: number = 0): Promise<ApiCheckResult> {
  // 检查缓存
  const cached = memoryCache[api.id];
  if (cached && isCacheValid(cached)) {
    return cached.result;
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(api.url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - start;
    const isOnline = response.status < 500;
    
    if (!isOnline && retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return checkApi(api, retries + 1);
    }
    
    const result: ApiCheckResult = {
      ...api,
      status: isOnline ? 'online' : 'offline',
      latency,
      lastChecked: new Date().toISOString(),
      retries,
    };

    // 更新缓存
    memoryCache[api.id] = {
      result,
      timestamp: Date.now(),
    };
    saveCacheToStorage();
    
    return result;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return checkApi(api, retries + 1);
    }
    
    const result: ApiCheckResult = {
      ...api,
      status: 'offline',
      latency: 0,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      retries,
    };

    // 更新缓存
    memoryCache[api.id] = {
      result,
      timestamp: Date.now(),
    };
    saveCacheToStorage();
    
    return result;
  }
}

export async function performCheck() {
  // 动态计算并发数，基于系统资源
  const systemConcurrency = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
  const dynamicConcurrent = Math.min(systemConcurrency, MAX_CONCURRENT_REQUESTS);
  
  const results: ApiCheckResult[] = [];
  
  for (let i = 0; i < APIS_TO_CHECK.length; i += dynamicConcurrent) {
    const batch = APIS_TO_CHECK.slice(i, i + dynamicConcurrent);
    const batchResults = await Promise.all(batch.map(api => checkApiWithMetrics(api)));
    results.push(...batchResults);
  }
  
  return results;
}

// 计算监控指标
async function calculateMetrics(apiId: string): Promise<{
  errorRate: number;
  availability: number;
  uptime: number;
  totalChecks: number;
  failedChecks: number;
}> {
  // 模拟数据，实际应该从历史记录中计算
  // 在实际应用中，应该从数据库中获取过去24小时的检查记录
  const totalChecks = 100;
  const failedChecks = Math.floor(Math.random() * 10);
  const errorRate = (failedChecks / totalChecks) * 100;
  const availability = ((totalChecks - failedChecks) / totalChecks) * 100;
  const uptime = availability;

  return {
    errorRate,
    availability,
    uptime,
    totalChecks,
    failedChecks,
  };
}

// 清除缓存
export function clearCache() {
  memoryCache = {};
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('apiCheckCache');
  }
}

// 增强的检查函数，包含指标计算
export async function checkApiWithMetrics(api: typeof APIS_TO_CHECK[0]): Promise<ApiCheckResult> {
  const result = await checkApi(api);
  const metrics = await calculateMetrics(api.id);
  
  return {
    ...result,
    errorRate: metrics.errorRate,
    availability: metrics.availability,
    uptime: metrics.uptime,
  };
}
