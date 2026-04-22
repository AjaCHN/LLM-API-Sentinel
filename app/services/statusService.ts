// app/services/statusService.ts v2.4.2

import { collection, setDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ApiStatus } from '../types';
import { createAlertIfNeeded } from './alertService';

export const updateApiStatus = async (result: ApiStatus): Promise<void> => {
  await setDoc(doc(db, 'api_status', result.id), result);
  await addDoc(collection(db, 'status_history'), {
    apiId: result.id,
    status: result.status,
    latency: result.latency,
    timestamp: serverTimestamp(),
  });
  
  // 检查是否需要创建告警
  await createAlertIfNeeded(result);
};
