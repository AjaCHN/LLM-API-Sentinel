// app/lib/mock-data.ts v2.7.0
// 模拟数据生成器 - 用于在 Supabase 不可用时生成测试数据
import { APIS_TO_CHECK } from '../constants';
import { ApiStatus } from '../types';

/**
 * 为单个 API 生成模拟状态数据
 */
export function generateMockApiStatus(api: typeof APIS_TO_CHECK[0]): ApiStatus {
  const isOnline = Math.random() > 0.1;
  const latency = Math.floor(Math.random() * 1000) + 50;
  
  return {
    ...api,
    status: isOnline ? (latency > 1000 ? 'degraded' : 'online') : 'offline',
    latency: isOnline ? latency : 0,
    lastChecked: new Date().toISOString(),
    errorRate: Math.floor(Math.random() * 5),
    availability: 95 + Math.floor(Math.random() * 5),
    uptime: 99.5 + Math.random() * 0.5,
    averageLatency: Math.floor(Math.random() * 800) + 100,
    maxLatency: Math.floor(Math.random() * 2000) + 1000,
    minLatency: Math.floor(Math.random() * 200) + 20
  };
}

/**
 * 为所有 API 生成模拟状态数据
 */
export function generateMockApiStatuses(): ApiStatus[] {
  return APIS_TO_CHECK.map(generateMockApiStatus).sort((a: ApiStatus, b: ApiStatus) => 
    a.name.localeCompare(b.name)
  );
}