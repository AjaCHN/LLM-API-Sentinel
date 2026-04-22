// app/services/alertService.ts v1.0.0

import { collection, addDoc, serverTimestamp, where, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ApiStatus, Alert } from '../types';

const LATENCY_THRESHOLD = 1500;

export const createAlertIfNeeded = async (result: ApiStatus): Promise<void> => {
  // 智能告警规则：检查是否已经存在未解决的相同类型告警
  const existingAlertsQuery = query(
    collection(db, 'alerts'),
    where('apiId', '==', result.id),
    where('type', '==', result.status === 'offline' ? 'downtime' : 'latency'),
    where('resolved', '==', false)
  );

  const existingAlertsSnapshot = await getDocs(existingAlertsQuery);
  const existingAlerts = existingAlertsSnapshot.docs;

  // 只有当不存在相同类型的未解决告警时才创建新告警
  if (existingAlerts.length === 0) {
    if (result.status === 'offline') {
      await addDoc(collection(db, 'alerts'), {
        apiId: result.id,
        apiName: result.name,
        type: 'downtime',
        severity: 'high',
        message: `${result.name} is currently offline.`,
        timestamp: serverTimestamp(),
        resolved: false,
        error: result.error,
        retries: result.retries
      });
    } else if (result.latency > LATENCY_THRESHOLD) {
      // 根据延迟值设置不同的严重程度
      let severity: 'low' | 'medium' | 'high' = 'medium';
      if (result.latency > LATENCY_THRESHOLD * 2) {
        severity = 'high';
      } else if (result.latency > LATENCY_THRESHOLD * 1.5) {
        severity = 'medium';
      } else {
        severity = 'low';
      }

      await addDoc(collection(db, 'alerts'), {
        apiId: result.id,
        apiName: result.name,
        type: 'latency',
        severity,
        message: `${result.name} latency is high: ${result.latency}ms.`,
        timestamp: serverTimestamp(),
        resolved: false,
        latency: result.latency
      });
    }
  }
};

export const resolveAlert = async (id: string): Promise<void> => {
  await updateDoc(doc(db, 'alerts', id), { resolved: true });
};
