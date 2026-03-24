// app/lib/firestore-server.ts v4.0.3
import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { ApiResult } from './monitor';

export async function saveApiStatus(result: ApiResult) {
  try {
    const statusRef = adminDb.collection('api_status').doc(result.id);
    const statusDoc = await statusRef.get();
    const prevStatus = statusDoc.exists ? statusDoc.data()?.status : null;
    
    const { lastChecked, ...rest } = result;
    await statusRef.set({
      ...rest,
      lastStatus: prevStatus,
      lastChecked: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Admin saveApiStatus failed:', error);
  }
}

export async function saveApiHistory(result: ApiResult) {
  try {
    await adminDb.collection('status_history').add({
      apiId: result.id,
      region: result.region,
      status: result.status,
      latency: result.latency,
      throughput: result.throughput,
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Admin saveApiHistory failed:', error);
  }
}
