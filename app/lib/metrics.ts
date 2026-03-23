// app/lib/metrics.ts v3.4.7
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';

export interface ApiMetric {
  apiId: string;
  latency: number;
  throughput: number;
  timestamp: Timestamp;
}

export async function saveMetric(metric: Omit<ApiMetric, 'timestamp'>) {
  try {
    await addDoc(collection(db, 'api_metrics'), {
      ...metric,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving metric:', error);
  }
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

async function sendEmailAlert(apiName: string, region: string, status: string, reason: string) {
  // Mock email sending functionality
  console.log(`[EMAIL ALERT] API: ${apiName} (${region}) | Status: ${status} | Reason: ${reason}`);
  // In a real application, you would integrate with Resend, SendGrid, AWS SES, etc.
}

export async function checkAndCreateAlerts(apiResult: any) {
  try {
    if (apiResult.status === 'offline') {
      const message = `API ${apiResult.name} (${apiResult.region}) is currently offline.`;
      await addDoc(collection(db, 'alerts'), {
        apiId: apiResult.id,
        apiName: apiResult.name,
        region: apiResult.region,
        type: 'outage',
        message,
        timestamp: Timestamp.now(),
        resolved: false
      });
      await sendEmailAlert(apiResult.name, apiResult.region, 'Offline', 'Transient interruption detected');
      return;
    }

    // Check last 10 metrics for availability < 90%
    const q = query(
      collection(db, 'api_metrics'),
      where('apiId', '==', apiResult.id),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const metrics: ApiMetric[] = [];
    querySnapshot.forEach((doc) => {
      metrics.push(doc.data() as ApiMetric);
    });

    if (metrics.length >= 10) {
      // Assuming throughput 0 means failed request for availability calculation
      const failedCount = metrics.filter(m => m.throughput === 0).length;
      const availability = ((10 - failedCount) / 10) * 100;
      
      if (availability < 90) {
        const message = `API ${apiResult.name} (${apiResult.region}) availability dropped to ${availability}%.`;
        await addDoc(collection(db, 'alerts'), {
          apiId: apiResult.id,
          apiName: apiResult.name,
          region: apiResult.region,
          type: 'degradation',
          message,
          timestamp: Timestamp.now(),
          resolved: false
        });
        await sendEmailAlert(apiResult.name, apiResult.region, 'Degraded', `Availability < 90% (${availability}%)`);
      }
    }
  } catch (error) {
    console.error('Error checking alerts:', error);
  }
}
