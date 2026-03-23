// app/lib/firestoreUtils.ts v3.4.7
import { db, auth } from '../lib/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isTransient = errorMessage.includes('CANCELLED') || 
                      errorMessage.toLowerCase().includes('idle stream') ||
                      errorMessage.toLowerCase().includes('timeout');

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  
  if (!isTransient) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }

  if (errorMessage.toLowerCase().includes('permission') || 
      errorMessage.toLowerCase().includes('unauthenticated') ||
      errorMessage.toLowerCase().includes('quota')) {
    throw new Error(JSON.stringify(errInfo));
  }
}

export async function saveApiStatus(result: any) {
  try {
    await setDoc(doc(db, 'api_status', result.id), result);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `api_status/${result.id}`);
  }
}

export async function saveApiHistory(result: any) {
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
    handleFirestoreError(error, OperationType.CREATE, 'status_history');
  }
}
