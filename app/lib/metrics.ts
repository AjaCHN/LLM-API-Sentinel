// app/lib/metrics.ts v2.5.1
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { StatusHistory } from '../types';

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
  const cutoffTime = new Date(Date.now() - timeWindow);

  const queryConstraints = [
    where('timestamp', '>=', cutoffTime),
    orderBy('timestamp', 'desc'),
    limit(maxResults)
  ];

  if (apiId) {
    queryConstraints.unshift(where('apiId', '==', apiId));
  }

  const q = query(collection(db, 'status_history'), ...queryConstraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      timestamp: data.timestamp?.toDate(),
      time: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString() : ''
    } as StatusHistory;
  });
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
    console.error('Failed to calculate metrics:', error);
    return _calculateMetricsFromHistory([]);
  }
}

export async function calculateAggregateMetrics(): Promise<ApiMetrics> {
  try {
    const history = await _fetchStatusHistory(undefined, 24 * 60 * 60 * 1000, 5000);
    return _calculateMetricsFromHistory(history);
  } catch (error) {
    console.error('Failed to calculate aggregate metrics:', error);
    return _calculateMetricsFromHistory([]);
  }
}
