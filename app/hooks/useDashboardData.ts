// app/hooks/useDashboardData.ts v2.1.0
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, limit, where, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { format } from 'date-fns';
import { ApiStatus, StatusHistory, Alert } from '../types';
import { getGeoInfo } from '../lib/geo';
import { updateApiStatus } from '../services/statusService';

interface GeoInfo {
  city: string;
  country: string;
  ip?: string;
}

export function useDashboardData() {
  const [statuses, setStatuses] = useState<ApiStatus[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [geo, setGeo] = useState<GeoInfo | null>(null);

  // 缓存地理位置信息，避免重复请求
  useEffect(() => {
    getGeoInfo().then(setGeo);
  }, []);

  const runCheck = useCallback(async () => {
    if (!auth.currentUser) return;
    
    setIsChecking(true);
    try {
      const res = await fetch('/api/check');
      const results: ApiStatus[] = await res.json();
      
      for (const result of results) {
        await updateApiStatus(result);
      }
    } catch (error) {
      console.error('Check failed:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));
    
    const qStatus = query(collection(db, 'api_status'));
    const unsubscribeStatus = onSnapshot(qStatus, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as ApiStatus);
      setStatuses(data.sort((a, b) => a.name.localeCompare(b.name)));
      setLastUpdate(new Date());
    });

    const qHistory = query(
      collection(db, 'status_history'), 
      orderBy('timestamp', 'desc'), 
      limit(100)
    );
    const unsubscribeHistory = onSnapshot(qHistory, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          ...d,
          time: d.timestamp ? format(d.timestamp.toDate(), 'HH:mm:ss') : '',
          timestamp: d.timestamp?.toDate()
        } as StatusHistory;
      }).reverse();
      setHistory(data);
    });

    const qAlerts = query(
      collection(db, 'alerts'),
      where('resolved', '==', false),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubscribeAlerts = onSnapshot(qAlerts, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Alert));
      setAlerts(data);
    });

    let interval: NodeJS.Timeout;
    if (user) {
      // 立即执行一次检查
      runCheck();
      // 然后每5分钟执行一次
      interval = setInterval(() => {
        runCheck();
      }, 5 * 60 * 1000);
    }

    return () => {
      unsubscribeAuth();
      unsubscribeStatus();
      unsubscribeHistory();
      unsubscribeAlerts();
      if (interval) clearInterval(interval);
    };
  }, [user, runCheck]);

  // 使用 useMemo 缓存计算结果
  const sortedStatuses = useMemo(() => {
    return statuses.sort((a, b) => a.name.localeCompare(b.name));
  }, [statuses]);

  const resolveAlert = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'alerts', id), { resolved: true });
  };

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return { 
    statuses: sortedStatuses, 
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
