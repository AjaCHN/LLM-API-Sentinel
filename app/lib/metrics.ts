// app/lib/metrics.ts v4.0.3
import { db } from './firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface ApiMetric {
  apiId: string;
  latency: number;
  throughput: number;
  timestamp: Timestamp;
}

export async function getMetricsBaseline(apiId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const q = query(
    collection(db, 'api_metrics'),
    where('apiId', '==', apiId),
    where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo))
  );
  
  try {
    const querySnapshot = await getDocs(q);
    const metrics: ApiMetric[] = [];
    querySnapshot.forEach((doc) => {
      metrics.push(doc.data() as ApiMetric);
    });
    
    if (metrics.length === 0) return null;
    
    const latencies = metrics.map(m => m.latency).sort((a, b) => a - b);
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p95Latency = latencies[Math.floor(latencies.length * 0.95)];
    const avgThroughput = metrics.reduce((a, b) => a + (b.throughput || 0), 0) / metrics.length;
    
    return {
      avgLatency,
      p95Latency,
      avgThroughput,
    };
  } catch (error) {
    console.error('Error getting metrics baseline:', error);
    return null;
  }
}


