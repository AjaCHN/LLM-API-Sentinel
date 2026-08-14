// app/lib/metrics.ts v2.8.2
import { supabase } from './supabase';
import type { StatusHistory } from '../types';
import { logError } from './error-handler';

export interface ApiMetrics {
  errorRate: number;
  availability: number;
  uptime: number;
  totalChecks: number;
  failedChecks: number;
  averageLatency: number;
  maxLatency: number;
  minLatency: number;
}

async function _fetchStatusHistory(
  apiId?: string,
  timeWindow: number = 24 * 60 * 60 * 1000,
  maxResults: number = 1000
): Promise<StatusHistory[]> {
  const cutoffTime = new Date(Date.now() - timeWindow).toISOString();

  let query = supabase
    .from('status_history')
    .select('*')
    .gte('timestamp', cutoffTime)
    .order('timestamp', { ascending: false })
    .limit(maxResults);

  if (apiId) {
    query = query.eq('api_id', apiId);
  }

  const { data, error } = await query;

  if (error) {
    logError(error, 'Failed to fetch status history');
    return [];
  }

  return (data || []).map(
    (doc: Record<string, unknown>): StatusHistory => {
      const rawTimestamp = typeof doc.timestamp === 'string' ? doc.timestamp : String(doc.timestamp ?? '');
      const parsedTime = new Date(rawTimestamp);
      return {
        id: typeof doc.id === 'string' ? doc.id : String(doc.id ?? ''),
        apiId: typeof doc.api_id === 'string' ? doc.api_id : String(doc.api_id ?? ''),
        status: (doc.status as StatusHistory['status']) ?? 'offline',
        latency: typeof doc.latency === 'number' ? doc.latency : Number(doc.latency ?? 0),
        timestamp: Number.isNaN(parsedTime.getTime()) ? new Date() : parsedTime,
        time: Number.isNaN(parsedTime.getTime()) ? '' : parsedTime.toLocaleTimeString(),
        error: typeof doc.error === 'string' ? doc.error : undefined,
        retries: typeof doc.retries === 'number' ? doc.retries : undefined
      };
    }
  );
}

function _calculateMetricsFromHistory(history: StatusHistory[]): ApiMetrics {
  if (history.length === 0) {
    return {
      errorRate: 0,
      availability: 100,
      uptime: 100,
      totalChecks: 0,
      failedChecks: 0,
      averageLatency: 0,
      maxLatency: 0,
      minLatency: 0
    };
  }

  const totalChecks = history.length;
  const failedChecks = history.filter(item => item.status === 'offline').length;
  const errorRate = (failedChecks / totalChecks) * 100;
  const availability = ((totalChecks - failedChecks) / totalChecks) * 100;
  const uptime = availability;

  const latencies = history.filter(item => item.latency > 0).map(item => item.latency);
  const averageLatency = latencies.length > 0 ? latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length : 0;
  const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;
  const minLatency = latencies.length > 0 ? Math.min(...latencies) : 0;

  return {
    errorRate,
    availability,
    uptime,
    totalChecks,
    failedChecks,
    averageLatency,
    maxLatency,
    minLatency
  };
}

export async function calculateMetrics(
  apiId: string,
  timeWindow: number = 24 * 60 * 60 * 1000
): Promise<ApiMetrics> {
  try {
    const history = await _fetchStatusHistory(apiId, timeWindow, 1000);
    return _calculateMetricsFromHistory(history);
  } catch (error) {
    logError(error, 'Failed to calculate metrics');
    return _calculateMetricsFromHistory([]);
  }
}

export async function calculateAggregateMetrics(): Promise<ApiMetrics> {
  try {
    const history = await _fetchStatusHistory(undefined, 24 * 60 * 60 * 1000, 5000);
    return _calculateMetricsFromHistory(history);
  } catch (error) {
    logError(error, 'Failed to calculate aggregate metrics');
    return _calculateMetricsFromHistory([]);
  }
}