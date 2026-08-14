// app/hooks/useDashboardStats.ts v2.8.5

import { useMemo } from 'react';
import type { ApiStatus, ChartDataPoint, StatusHistory } from '@/types';

export interface DashboardStats {
  online: number;
  degraded: number;
  offline: number;
  avgLatency: number;
}

export interface DashboardStatsResult {
  stats: DashboardStats;
  chartData: ChartDataPoint[];
}

// 时间范围窗口（毫秒）：1h / 6h / 24h
const TIME_RANGE_WINDOWS_MS = [60 * 60 * 1000, 6 * 60 * 60 * 1000, 24 * 60 * 60 * 1000];

/** 集中计算仪表盘统计指标与图表数据，避免在组件中重复 useMemo */
export function useDashboardStats(
  statuses: ApiStatus[],
  history: StatusHistory[],
  activeRange = 0
): DashboardStatsResult {
  // 性能优化: 使用 Map 进行 O(1) 查找替代 Array.find 的 O(n) 查找
  // 时间范围过滤：仅保留窗口内的最近历史，让 24h/6h/1h 切换真实生效
  const chartData = useMemo(() => {
    const windowMs = TIME_RANGE_WINDOWS_MS[activeRange] ?? TIME_RANGE_WINDOWS_MS[0];
    const cutoff = Date.now() - windowMs;
    const filtered = history.filter((h) => {
      const ts = h.timestamp instanceof Date ? h.timestamp.getTime() : new Date(h.timestamp).getTime();
      return ts >= cutoff;
    });

    const timeMap = new Map<string, ChartDataPoint>();

    for (const curr of filtered) {
      const time = curr.time;
      if (!time) continue;

      const existing = timeMap.get(time);
      if (existing) {
        existing[curr.apiId] = curr.latency;
      } else {
        const point = { time, [curr.apiId]: curr.latency } as ChartDataPoint;
        timeMap.set(time, point);
      }
    }

    return Array.from(timeMap.values());
  }, [history, activeRange]);

  // 性能优化: 使用 useMemo 缓存统计计算结果
  const stats = useMemo(() => {
    const online = statuses.filter((s) => s.status === 'online').length;
    const degraded = statuses.filter((s) => s.status === 'degraded').length;
    const offline = statuses.filter((s) => s.status === 'offline').length;
    const avgLatency =
      statuses.length > 0
        ? Math.round(statuses.reduce((sum, s) => sum + s.latency, 0) / statuses.length)
        : 0;
    return { online, degraded, offline, avgLatency };
  }, [statuses]);

  return { stats, chartData };
}
