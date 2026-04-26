// app/hooks/useApiMonitor.ts v2.5.0
import { useCallback } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useApiStore, useAuthStore } from '../store';
import { LATENCY_THRESHOLD } from '../constants';
import { ApiStatus, Alert } from '../types';
import { logError, handleError } from '../lib/error';
import { sendAlert } from '../lib/notification';

export function useApiMonitor() {
  const { 
    statuses, 
    history, 
    isChecking, 
    setIsChecking, 
    setLastUpdate 
  } = useApiStore();
  const { setError } = useAuthStore();

  const runCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/check');
      const results: ApiStatus[] = await res.json();
      
      for (const result of results) {
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
            const alertData: Omit<Alert, 'id'> = {
              apiId: result.id,
              apiName: result.name,
              type: 'downtime',
              severity: 'high',
              message: `${result.name} is currently offline.`,
              timestamp: serverTimestamp(),
              resolved: false,
              error: result.error,
              retries: result.retries
            };
            const alertRef = await addDoc(collection(db, 'alerts'), alertData);
            // 发送通知
            await sendAlert({
              id: alertRef.id,
              ...alertData
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

            const alertData: Omit<Alert, 'id'> = {
              apiId: result.id,
              apiName: result.name,
              type: 'latency',
              severity,
              message: `${result.name} latency is high: ${result.latency}ms.`,
              timestamp: serverTimestamp(),
              resolved: false,
              latency: result.latency
            };
            const alertRef = await addDoc(collection(db, 'alerts'), alertData);
            // 发送通知
            await sendAlert({
              id: alertRef.id,
              ...alertData
            });
          }
        }
      }
    } catch (error) {
      logError(error, 'Check failed');
      setError(handleError(error).message);
    } finally {
      setIsChecking(false);
      setLastUpdate(new Date());
    }
  }, [setIsChecking, setLastUpdate, setError]);

  return { 
    statuses, 
    history, 
    isChecking, 
    runCheck 
  };
}
