// app/lib/metrics.ts v2.5.0
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

// 计算监控指标
export async function calculateMetrics(apiId: string, timeWindow: number = 24 * 60 * 60 * 1000): Promise<ApiMetrics> {
  try {
    const cutoffTime = new Date(Date.now() - timeWindow);
    
    const q = query(
      collection(db, 'status_history'),
      where('apiId', '==', apiId),
      where('timestamp', '>=', cutoffTime),
      orderBy('timestamp', 'desc'),
      limit(1000) // 限制查询数量以提高性能
    );
    
    const snapshot = await getDocs(q);
    const history: StatusHistory[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate(),
        time: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString() : ''
      } as StatusHistory;
    });
    
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
  } catch (error) {
    console.error('Failed to calculate metrics:', error);
    // 返回默认值
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
}

// 计算所有 API 的聚合指标
export async function calculateAggregateMetrics(): Promise<ApiMetrics> {
  try {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const q = query(
      collection(db, 'status_history'),
      where('timestamp', '>=', cutoffTime),
      orderBy('timestamp', 'desc'),
      limit(5000) // 限制查询数量以提高性能
    );
    
    const snapshot = await getDocs(q);
    const history: StatusHistory[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate(),
        time: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString() : ''
      } as StatusHistory;
    });
    
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
  } catch (error) {
    console.error('Failed to calculate aggregate metrics:', error);
    // 返回默认值
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
}
