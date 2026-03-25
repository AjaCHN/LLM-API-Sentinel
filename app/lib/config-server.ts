// app/lib/config-server.ts v4.0.6
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ApiConfig } from './monitor';

export async function getApiConfigAdmin(apiId: string) {
  try {
    const docRef = doc(db, 'api_configs', apiId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ApiConfig;
    }
  } catch (error) {
    console.error('Server getApiConfig failed:', error);
  }
  return null;
}

export async function saveApiConfigAdmin(config: ApiConfig) {
  try {
    await setDoc(doc(db, 'api_configs', config.id), config);
  } catch (error) {
    console.error('Server saveApiConfig failed:', error);
  }
}
