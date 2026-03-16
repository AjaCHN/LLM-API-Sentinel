// app/lib/config.ts v1.0.0
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ApiConfig } from './monitor';

export async function saveApiConfig(config: ApiConfig) {
  try {
    await setDoc(doc(db, 'api_configs', config.id), config);
  } catch (error) {
    console.error('Error saving config:', error);
  }
}

export async function getApiConfig(apiId: string) {
  try {
    const docRef = doc(db, 'api_configs', apiId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ApiConfig;
    }
  } catch (error) {
    console.error('Error getting config:', error);
  }
  return null;
}
