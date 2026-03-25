// app/lib/metrics-server.ts v4.0.4
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export async function saveMetric(metric: { apiId: string; latency: number; throughput: number }) {
  try {
    await addDoc(collection(db, 'api_metrics'), {
      ...metric,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Server saveMetric failed:', error);
  }
}

async function sendEmailAlert(apiName: string, region: string, status: string, reason: string) {
  // Mock email sending functionality
  console.log(`[EMAIL ALERT] API: ${apiName} (${region}) | Status: ${status} | Reason: ${reason}`);
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
        timestamp: serverTimestamp(),
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
    
    const metricsSnap = await getDocs(q);
    const metrics = metricsSnap.docs.map(doc => doc.data());

    if (metrics.length >= 10) {
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
          timestamp: serverTimestamp(),
          resolved: false
        });
        await sendEmailAlert(apiResult.name, apiResult.region, 'Degraded', `Availability < 90% (${availability}%)`);
      }
    }
  } catch (error) {
    console.error('Server checkAndCreateAlerts failed:', error);
  }
}
