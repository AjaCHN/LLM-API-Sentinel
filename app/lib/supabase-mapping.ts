  // app/lib/supabase-mapping.ts v2.7.2

import type { ApiStatus } from '@/types';

/** 将内存中的 ApiStatus 映射为 api_status 表的 upsert 结构 */
export function toApiStatusUpsert(statuses: ApiStatus[]) {
  return statuses.map((result) => ({
    id: result.id,
    name: result.name,
    provider: result.provider,
    url: result.url,
    status: result.status,
    latency: result.latency,
    last_checked: result.lastChecked,
    error: result.error || null,
    retries: result.retries || 0,
    error_rate: result.errorRate || 0,
    availability: result.availability || 100,
    uptime: result.uptime || 100,
    average_latency: result.averageLatency ?? undefined,
    max_latency: result.maxLatency ?? undefined,
    min_latency: result.minLatency ?? undefined,
    updated_at: new Date().toISOString(),
  }));
}

/** 将内存中的 ApiStatus 映射为 status_history 表的插入结构 */
export function toStatusHistoryInsert(statuses: ApiStatus[]) {
  return statuses.map((result) => ({
    api_id: result.id,
    status: result.status,
    latency: result.latency,
    error: result.error || null,
    retries: result.retries || 0,
    timestamp: new Date().toISOString(),
  }));
}

/** 将 Supabase api_status 行映射回前端 ApiStatus 模型 */
export function fromApiStatusRow(doc: Record<string, unknown>): ApiStatus {
  return {
    id: doc.id as string,
    name: doc.name as string,
    provider: doc.provider as string,
    url: doc.url as string,
    status: doc.status as ApiStatus['status'],
    latency: doc.latency as number,
    lastChecked: doc.last_checked as string,
    error: doc.error as string | undefined,
    retries: doc.retries as number,
    errorRate: doc.error_rate as number,
    availability: doc.availability as number,
    uptime: doc.uptime as number,
    averageLatency: doc.average_latency as number | undefined,
    maxLatency: doc.max_latency as number | undefined,
    minLatency: doc.min_latency as number | undefined,
  };
}
