// app/lib/config-server.ts v4.0.5
import { adminDb } from './firebase-admin';
import { ApiConfig } from './monitor';

export async function getApiConfigAdmin(apiId: string) {
  try {
    const docRef = adminDb.collection('api_configs').doc(apiId);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return docSnap.data() as ApiConfig;
    }
  } catch (error) {
    console.error('Admin getApiConfig failed:', error);
  }
  return null;
}

export async function saveApiConfigAdmin(config: ApiConfig) {
  try {
    await adminDb.collection('api_configs').doc(config.id).set(config);
  } catch (error) {
    console.error('Admin saveApiConfig failed:', error);
  }
}
