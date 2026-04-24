// app/hooks/useDashboardData.ts v2.5.0
'use client';

import { useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, limit, setDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import { useApiStore } from '../store';
import { CHECK_INTERVAL } from '../constants';
import { ApiStatus, StatusHistory } from '../types';
import { logError } from '../lib/error';
import { useGeoLocation } from './useGeoLocation';
import { useApiMonitor } from './useApiMonitor';
import { useAlerts } from './useAlerts';
import { useAuth } from './useAuth';

export function useDashboardData() {
  // 使用专注的钩子
  const { geo } = useGeoLocation();
  const { statuses, history, isChecking, runCheck } = useApiMonitor();
  const { alerts, resolveAlert } = useAlerts();
  const { user, login, logout } = useAuth();

  const { setStatuses, setHistory, setLastUpdate } = useApiStore();

  // 监听 API 状态变化
  useEffect(() => {
    const qStatus = query(collection(db, 'api_status'));
    const unsubscribeStatus = onSnapshot(qStatus, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => doc.data() as ApiStatus);
        setStatuses(data.sort((a, b) => a.name.localeCompare(b.name)));
        setLastUpdate(new Date());
      } catch (error) {
        logError(error, 'Failed to update statuses');
      }
    });

    const qHistory = query(
      collection(db, 'status_history'), 
      orderBy('timestamp', 'desc'), 
      limit(100)
    );
    const unsubscribeHistory = onSnapshot(qHistory, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            ...d,
            time: d.timestamp ? format(d.timestamp.toDate(), 'HH:mm:ss') : '',
            timestamp: d.timestamp?.toDate()
          } as StatusHistory;
        }).reverse();
        setHistory(data);
      } catch (error) {
        logError(error, 'Failed to update history');
      }
    });

    let interval: NodeJS.Timeout;
    if (user) {
      // 立即执行一次检查
      runCheck();
      // 然后每5分钟执行一次
      interval = setInterval(() => {
        runCheck();
      }, CHECK_INTERVAL);
    }

    return () => {
      unsubscribeStatus();
      unsubscribeHistory();
      if (interval) clearInterval(interval);
    };
  }, [user, runCheck, setStatuses, setHistory, setLastUpdate]);

  return { 
    statuses, 
    history, 
    alerts, 
    user, 
    isChecking, 
    lastUpdate, 
    geo, 
    runCheck, 
    resolveAlert, 
    login, 
    logout 
  };
}
