// app/lib/monitor.ts v2.5.0
import { APIS_TO_CHECK, MAX_RETRIES, RETRY_DELAY } from '../constants';
import { ApiCheckResult } from '../types';
import { getCache, setCache, initializeCache } from './cache';
import { calculateMetrics } from './metrics';
import { concurrencyManager, processBatch } from './concurrency';

// 初始化缓存
initializeCache();

async function checkApi(api: typeof APIS_TO_CHECK[0], retries: number = 0): Promise<ApiCheckResult> {
  // 检查缓存
  const cachedResult = getCache(api.id);
  if (cachedResult) {
    return cachedResult;
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
    setCache(api.id, result);
    
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
    setCache(api.id, result);
    
    return result;
  }
}

export async function performCheck() {
  // 使用并发管理器处理请求
  const results = await processBatch(
    APIS_TO_CHECK,
    (api) => checkApiWithMetrics(api),
    {
      priority: 'medium',
      timeout: 30000,
      retries: 1,
      retryDelay: 1000
    }
  );
  
  return results;
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
    averageLatency: metrics.averageLatency,
    maxLatency: metrics.maxLatency,
    minLatency: metrics.minLatency,
  };
}

// 获取并发管理器状态
export function getConcurrencyStatus(): import('../types').ConcurrencyStatus {
  return {
    queueLength: concurrencyManager.getQueueLength(),
    activeRequests: concurrencyManager.getActiveRequests(),
    concurrencyLimit: concurrencyManager.getConcurrencyLimit(),
    networkQuality: concurrencyManager.getNetworkQuality()
  };
}


