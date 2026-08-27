// app/lib/monitor.ts v2.10.18
import { APIS_TO_CHECK, MAX_RETRIES, RETRY_DELAY, DEGRADED_THRESHOLD } from '../constants';
import { ApiCheckResult } from '../types';
import { getCache, setCache, initializeCache } from './cache';
import { concurrencyManager, processBatch } from './concurrency';
import { loadMetricsFromStorage, persistSingleMetric } from './metrics-storage';

export interface HistoricalMetrics {
  totalChecks: number;
  failedChecks: number;
  totalLatency: number;
  maxLatency: number;
  minLatency: number;
}

// 从持久化存储加载累计指标，保证跨刷新真实累加（可用性/延迟历史基于真实探测次数）
const metricsCache: Map<string, HistoricalMetrics> = new Map(
  Object.entries(loadMetricsFromStorage())
);

// 安全清理错误消息，防止敏感信息泄露到缓存
function sanitizeErrorMessage(message: string): string {
  // 限制长度并移除可能包含敏感信息的模式（如 URL、Token、密钥）
  const cleaned = message
    .replace(/https?:\/\/[^\s]+/g, '[URL]')
    .replace(/[a-zA-Z0-9_-]*(?:key|token|secret|auth|password)[a-zA-Z0-9_-]*[:=]\s*[^\s]+/gi, '[REDACTED]')
    .slice(0, 200);
  return cleaned || 'Request failed';
}

function calculateRealMetrics(
  apiId: string,
  currentLatency: number,
  isOnline: boolean,
  totalChecks: number = 1
): { errorRate: number; availability: number; uptime: number; averageLatency: number; maxLatency: number; minLatency: number } {
  const existingMetrics = metricsCache.get(apiId);

  if (!existingMetrics) {
    const initialMetrics: HistoricalMetrics = {
      totalChecks: totalChecks,
      failedChecks: isOnline ? 0 : 1,
      totalLatency: isOnline ? currentLatency : 0,
      maxLatency: isOnline ? currentLatency : 0,
      minLatency: isOnline ? currentLatency : Number.MAX_SAFE_INTEGER
    };
    metricsCache.set(apiId, initialMetrics);
    persistSingleMetric(apiId, initialMetrics);
    return calculateFromMetrics(initialMetrics, currentLatency);
  }

  const updatedMetrics: HistoricalMetrics = {
    totalChecks: Math.min(existingMetrics.totalChecks + 1, 1000),
    failedChecks: isOnline ? existingMetrics.failedChecks : existingMetrics.failedChecks + 1,
    totalLatency: isOnline ? existingMetrics.totalLatency + currentLatency : existingMetrics.totalLatency,
    maxLatency: isOnline ? Math.max(existingMetrics.maxLatency, currentLatency) : existingMetrics.maxLatency,
    minLatency: isOnline ? Math.min(existingMetrics.minLatency, currentLatency) : existingMetrics.minLatency
  };

  metricsCache.set(apiId, updatedMetrics);
  persistSingleMetric(apiId, updatedMetrics);
  return calculateFromMetrics(updatedMetrics, currentLatency);
}

function calculateFromMetrics(metrics: HistoricalMetrics, currentLatency: number) {
  const errorRate = metrics.totalChecks > 0 
    ? (metrics.failedChecks / metrics.totalChecks) * 100 
    : 0;
  
  const availability = metrics.totalChecks > 0 
    ? ((metrics.totalChecks - metrics.failedChecks) / metrics.totalChecks) * 100 
    : 100;
  
  const uptime = availability;
  
  const averageLatency = metrics.totalChecks - metrics.failedChecks > 0 
    ? metrics.totalLatency / (metrics.totalChecks - metrics.failedChecks) 
    : currentLatency;
  
  return {
    errorRate: Math.round(errorRate * 100) / 100,
    availability: Math.round(availability * 100) / 100,
    uptime: Math.round(uptime * 100) / 100,
    averageLatency: Math.round(averageLatency),
    maxLatency: metrics.maxLatency,
    minLatency: metrics.minLatency === Number.MAX_SAFE_INTEGER ? 0 : metrics.minLatency
  };
}

function determineStatus(isOnline: boolean, latency: number): 'online' | 'offline' | 'degraded' {
  if (!isOnline) {
    return 'offline';
  }
  
  if (latency > DEGRADED_THRESHOLD || latency === 0) {
    return 'degraded';
  }
  
  return 'online';
}

initializeCache();

async function checkApi(api: typeof APIS_TO_CHECK[0], retries: number = 0): Promise<ApiCheckResult> {
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
    // 注：isOnline 仅代表端点 HTTP 可达（status < 500）。
    // 多数受监控端点为需鉴权的 /v1/models 接口，无 Key 访问会返回 401/403（<500），
    // 此时仍判为 online 表示"端点可达"，不代表服务对真实调用方可用。
    const isOnline = response.status < 500;
    
    if (!isOnline && retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return checkApi(api, retries + 1);
    }
    
    const realMetrics = calculateRealMetrics(api.id, latency, isOnline);
    const status = determineStatus(isOnline, latency);
    
    const result: ApiCheckResult = {
      ...api,
      status,
      latency,
      lastChecked: new Date().toISOString(),
      retries,
      errorRate: realMetrics.errorRate,
      availability: realMetrics.availability,
      uptime: realMetrics.uptime,
      averageLatency: realMetrics.averageLatency,
      maxLatency: realMetrics.maxLatency,
      minLatency: realMetrics.minLatency
    };

    setCache(api.id, result);
    
    return result;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return checkApi(api, retries + 1);
    }
    
    const realMetrics = calculateRealMetrics(api.id, 0, false);
    
    const result: ApiCheckResult = {
      ...api,
      status: 'offline',
      latency: 0,
      lastChecked: new Date().toISOString(),
      // 安全清理：避免将潜在的敏感信息存入缓存
      error: error instanceof Error ? sanitizeErrorMessage(error.message) : 'Request failed',
      retries,
      errorRate: realMetrics.errorRate,
      availability: realMetrics.availability,
      uptime: realMetrics.uptime,
      averageLatency: realMetrics.averageLatency,
      maxLatency: realMetrics.maxLatency,
      minLatency: realMetrics.minLatency
    };

    setCache(api.id, result);
    
    return result;
  }
}

export async function performCheck(): Promise<ApiCheckResult[]> {
  // 使用并发管理器处理请求
  const results = await processBatch(
    APIS_TO_CHECK,
    (api) => checkApi(api),
    {
      priority: 'medium',
      timeout: 30000,
      retries: 1,
      retryDelay: 1000
    }
  );
  
  return results;
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
