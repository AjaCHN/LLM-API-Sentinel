// app/hooks/useApiMonitor.ts v2.6.0
// 改进：使用本地 API 检查，同时支持从 Firestore 同步数据
import { useCallback, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useApiStore, useAuthStore } from '../store';
import { LATENCY_THRESHOLD, APIS_TO_CHECK } from '../constants';
import { ApiStatus, Alert, StatusHistory } from '../types';
import { logError, handleError } from '../lib/error';
import { performCheck } from '../lib/monitor';
import { sendAlert } from '../lib/notification';

export function useApiMonitor() {
  const { 
    statuses, 
    history, 
    isChecking, 
    setIsChecking, 
    setLastUpdate,
    setStatuses,
    addHistoryEntry
  } = useApiStore();
  const { setError } = useAuthStore();

  // 同步 API 状态到 Firestore
  const syncToFirestore = useCallback(async (results: ApiStatus[]) => {
    try {
      for (const result of results) {
        const docRef = doc(db, 'api_status', result.id);
        await setDoc(docRef, result);
        
        // 添加历史记录
        const historyDoc = doc(collection(db, 'status_history'));
        await setDoc(historyDoc, {
          apiId: result.id,
          status: result.status,
          latency: result.latency,
          timestamp: serverTimestamp()
        });
      }
    } catch (err) {
      logError(err, 'Failed to sync to Firestore');
    }
  }, []);

  // 智能告警检查函数
  const checkAndCreateAlert = useCallback(async (result: ApiStatus) => {
    try {
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
          message: result.name + " is currently offline.",
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
          message: result.name + " latency is high: " + result.latency + "ms.",
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
    } catch (err) {
      logError(err, 'Failed to check and create alert');
    }
  }, []);

  // 主检查函数，使用本地 API 检查
  const runCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      // 执行本地 API 检查
      const results = await performCheck();
      
      // 更新状态
      setStatuses(results.sort((a, b) => a.name.localeCompare(b.name)));
      setLastUpdate(new Date());

      // 添加到历史记录
      for (const result of results) {
        const historyEntry: StatusHistory = {
          id: `${result.id}-${Date.now()}`,
          apiId: result.id,
          status: result.status,
          latency: result.latency,
          time: new Date().toLocaleTimeString(),
          timestamp: new Date()
        };
        addHistoryEntry(historyEntry);
      }

      // 对每个 API 状态检查是否需要创建告警
      for (const result of results) {
        await checkAndCreateAlert(result);
      }

      // 尝试同步到 Firestore（可选）
      try {
        await syncToFirestore(results);
      } catch (err) {
        // 如果 Firestore 同步失败，只记录错误，不影响用户体验
        logError(err, 'Firestore sync failed');
      }

    } catch (err) {
      logError(err, 'Check failed');
      setError(handleError(err).message);
    } finally {
      setIsChecking(false);
    }
  }, [setIsChecking, setLastUpdate, setError, setStatuses, addHistoryEntry, checkAndCreateAlert, syncToFirestore]);

  // 初始化时尝试从 Firestore 加载（可选），否则使用本地模拟数据
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'api_status'));
        if (snapshot.docs.length > 0) {
          const data = snapshot.docs.map(doc => doc.data() as ApiStatus);
          setStatuses(data.sort((a, b) => a.name.localeCompare(b.name)));
        } else {
          // 如果 Firestore 中没有数据，生成模拟数据
          const mockData = APIS_TO_CHECK.map((api: any) => ({
            ...api,
            status: Math.random() > 0.1 ? 'online' : 'offline',
            latency: Math.floor(Math.random() * 1000) + 50,
            lastChecked: new Date().toISOString(),
            errorRate: Math.floor(Math.random() * 5),
            availability: 95 + Math.floor(Math.random() * 5),
            uptime: 99.5 + Math.random() * 0.5,
            averageLatency: Math.floor(Math.random() * 800) + 100,
            maxLatency: Math.floor(Math.random() * 2000) + 1000,
            minLatency: Math.floor(Math.random() * 200) + 20
          }));
          setStatuses(mockData);
        }
      } catch {
        // 如果 Firestore 加载失败，生成模拟数据
        const mockData = APIS_TO_CHECK.map((api: any) => ({
          ...api,
          status: Math.random() > 0.1 ? 'online' : 'offline',
          latency: Math.floor(Math.random() * 1000) + 50,
          lastChecked: new Date().toISOString(),
          errorRate: Math.floor(Math.random() * 5),
          availability: 95 + Math.floor(Math.random() * 5),
          uptime: 99.5 + Math.random() * 0.5,
          averageLatency: Math.floor(Math.random() * 800) + 100,
          maxLatency: Math.floor(Math.random() * 2000) + 1000,
          minLatency: Math.floor(Math.random() * 200) + 20
        }));
        setStatuses(mockData);
      }
    };

    if (statuses.length === 0) {
      loadInitialData();
    }
  }, [statuses.length, setStatuses]);

  return { 
    statuses, 
    history, 
    isChecking, 
    runCheck 
  };
}
