// app/lib/firestore-server.ts v4.0.4
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ApiResult } from './monitor';

export async function saveApiStatus(result: ApiResult) {
  try {
    const statusRef = doc(db, 'api_status', result.id);
    const statusDoc = await getDoc(statusRef);
    const prevStatus = statusDoc.exists() ? statusDoc.data()?.status : null;
    
    const { lastChecked, ...rest } = result;
    await setDoc(statusRef, {
      ...rest,
      lastStatus: prevStatus,
      lastChecked: serverTimestamp(),
    });
  } catch (error) {
    console.error('Server saveApiStatus failed:', error);
  }
}

export async function saveApiHistory(result: ApiResult) {
  try {
    await addDoc(collection(db, 'status_history'), {
      apiId: result.id,
      region: result.region,
      status: result.status,
      latency: result.latency,
      throughput: result.throughput,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Server saveApiHistory failed:', error);
  }
}
