// app/lib/metrics-storage.ts v2.10.18
// 累计指标持久化：确保可用性/延迟累计跨刷新真实累加，而非每次会话重置
import type { HistoricalMetrics } from './monitor';

const METRICS_VERSION = 'v1';
const METRICS_KEY = `apiMetrics_${METRICS_VERSION}_data`;

type MetricsMap = Record<string, HistoricalMetrics>;

/** 从 storage 读取全部累计指标 */
export function loadMetricsFromStorage(): MetricsMap {
  if (typeof localStorage === 'undefined') return {};
  try {
    const cached = localStorage.getItem(METRICS_KEY);
    if (!cached) return {};
    const parsed = JSON.parse(cached);
    if (parsed && typeof parsed === 'object') {
      return parsed as MetricsMap;
    }
  } catch {
    // 静默忽略损坏数据
  }
  return {};
}

/** 增量持久化单条指标，避免全量重序列化 */
export function persistSingleMetric(apiId: string, metrics: HistoricalMetrics): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const cached = localStorage.getItem(METRICS_KEY);
    const parsed: MetricsMap = cached ? JSON.parse(cached) : {};
    parsed[apiId] = metrics;
    localStorage.setItem(METRICS_KEY, JSON.stringify(parsed));
  } catch {
    // 忽略写入失败（如隐私模式）
  }
}

/** 清除全部累计指标 */
export function clearMetricsStorage(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(METRICS_KEY);
  } catch {
    // 忽略
  }
}
