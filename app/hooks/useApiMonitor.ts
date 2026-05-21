// app/hooks/useApiMonitor.ts v2.5.1
// 改进：不依赖 API 路由，直接从 Firestore 获取最新状态
import { useCallback } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, getDoc } from 'firebase/firestore';
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

  // 智能告警检查函数
  const checkAndCreateAlert = useCallback(async (result: ApiStatus) => {
    const existingAlertsQuery = query(
      collection(db, 'alerts'),
      where('apiId', '==', result.id),
      where('type', '==', result.status === 'offline' ? 'downtime' : 'latency'),
      where('resolved', '==', false)
    );

    const existingAlertsSnapshot = await getDocs(existingAlertsQuery);
    const existingAlerts = existingAlertsSnapshot.docs;

    if (existingAlerts.length > 0) {
      return; // 已有未解决的同类告警，跳过
    }

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
      await sendAlert({
        id: alertRef.id,
        ...alertData
      });
    } else if (result.latency > LATENCY_THRESHOLD) {
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
      await sendAlert({
        id: alertRef.id,
        ...alertData
      });
    }
  }, []);

  // 从 Firestore 获取最新状态并检查告警（不再依赖 API 路由）
  const runCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      // 直接从 Firestore 获取最新的 API 状态
      const snapshot = await getDocs(collection(db, 'api_status'));
      const results: ApiStatus[] = [];
      
      snapshot.forEach(doc => {
        results.push(doc.data() as ApiStatus);
      });

      // 对每个 API 状态检查是否需要创建告警
      for (const result of results) {
        await checkAndCreateAlert(result);
      }
    } catch (error) {
      logError(error, 'Check failed');
      setError(handleError(error).message);
    } finally {
      setIsChecking(false);
      setLastUpdate(new Date());
    }
  }, [setIsChecking, setLastUpdate, setError, checkAndCreateAlert]);

  return { 
    statuses, 
    history, 
    isChecking, 
    runCheck 
  };
}
