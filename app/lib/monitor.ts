// app/lib/monitor.ts v2.6.3
import { APIS_TO_CHECK, getApisToCheck, MAX_RETRIES, RETRY_DELAY, DEGRADED_THRESHOLD } from '../constants';
import { ApiCheckResult } from '../types';
import { getCache, setCache, initializeCache } from './cache';
import { concurrencyManager, processBatch } from './concurrency';

interface HistoricalMetrics {
  totalChecks: number;
  failedChecks: number;
  totalLatency: number;
  maxLatency: number;
  minLatency: number;
}

// 指标窗口上限：超过后采用滑动窗口估算，防止 totalLatency 累积导致均值漂移
const METRICS_CAP = 1000;

const metricsCache: Map<string, HistoricalMetrics> = new Map();

function calculateRealMetrics(
  apiId: string,
  currentLatency: number,
  isOnline: boolean,
  initialTotalChecks: number = 100
): { errorRate: number; availability: number; uptime: number; averageLatency: number; maxLatency: number; minLatency: number } {
  const existingMetrics = metricsCache.get(apiId);

  if (!existingMetrics) {
    const initialMetrics: HistoricalMetrics = {
      totalChecks: initialTotalChecks,
      failedChecks: isOnline ? 0 : 1,
      totalLatency: isOnline ? currentLatency : 0,
      maxLatency: isOnline ? currentLatency : 0,
      minLatency: isOnline ? currentLatency : Number.MAX_SAFE_INTEGER
    };
    metricsCache.set(apiId, initialMetrics);
    return calculateFromMetrics(initialMetrics, currentLatency);
  }
  
  const atCap = existingMetrics.totalChecks >= METRICS_CAP;
  const totalChecks = atCap ? METRICS_CAP : existingMetrics.totalChecks + 1;
  // Sliding-window: remove the oldest estimate's contribution, add the newest.
  const removeFraction = atCap ? 1 / existingMetrics.totalChecks : 0;
  const totalLatency = isOnline
    ? existingMetrics.totalLatency - existingMetrics.totalLatency * removeFraction + currentLatency
    : existingMetrics.totalLatency - existingMetrics.totalLatency * removeFraction;
  const failedChecks = isOnline
    ? Math.max(0, existingMetrics.failedChecks - existingMetrics.failedChecks * removeFraction)
    : (atCap ? existingMetrics.failedChecks - existingMetrics.failedChecks * removeFraction + 1 : existingMetrics.failedChecks + 1);
  const updatedMetrics: HistoricalMetrics = {
    totalChecks,
    failedChecks,
    totalLatency,
    maxLatency: isOnline ? Math.max(existingMetrics.maxLatency, currentLatency) : existingMetrics.maxLatency,
    minLatency: isOnline ? Math.min(existingMetrics.minLatency, currentLatency) : existingMetrics.minLatency
  };
  
  metricsCache.set(apiId, updatedMetrics);
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

async function checkApi(api: typeof APIS_TO_CHECK[0], retries: number = 0, forceRefresh: boolean = false): Promise<ApiCheckResult> {
  const cachedResult = getCache(api.id);
  if (cachedResult && !forceRefresh) {
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
      error: error instanceof Error ? error.message : String(error),
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

export async function performCheck(forceRefresh: boolean = false): Promise<ApiCheckResult[]> {
  // 运行时获取最新 API 配置，避免使用模块加载时的快照
  const apis = getApisToCheck();
  // 使用并发管理器处理请求（重试由 checkApi 内部负责，此处不再叠加重试）
  const results = await processBatch(
    apis,
    (api) => checkApi(api, 0, forceRefresh),
    {
      priority: 'medium',
      timeout: 30000,
      retries: 0,
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

// 清理不再监控的 API 的指标缓存，避免内存泄漏
export function pruneMetricsCache(activeApiIds: string[]): void {
  const activeSet = new Set(activeApiIds);
  for (const key of metricsCache.keys()) {
    if (!activeSet.has(key)) {
      metricsCache.delete(key);
    }
  }
}
