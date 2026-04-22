// app/hooks/useDashboardData.ts v2.4.3
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, limit, setDoc, doc, addDoc, serverTimestamp, where, updateDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { format } from 'date-fns';

const LATENCY_THRESHOLD = 1500;

interface ApiStatus {
  id: string;
  name: string;
  provider: string;
  url: string;
  status: 'online' | 'offline';
  latency: number;
  lastChecked: string;
  error?: string;
  retries?: number;
}

interface StatusHistory {
  apiId: string;
  status: 'online' | 'offline';
  latency: number;
  timestamp: Date;
  time: string;
}

interface Alert {
  id: string;
  apiId: string;
  apiName: string;
  type: 'downtime' | 'latency';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: any;
  resolved: boolean;
  error?: string;
  retries?: number;
  latency?: number;
}

export function useDashboardData() {
  const [statuses, setStatuses] = useState<ApiStatus[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [geo, setGeo] = useState<any | null>(null);

  // 缓存地理位置信息，避免重复请求
  useEffect(() => {
    // 检查本地存储是否有缓存的地理位置信息
    const cachedGeo = localStorage.getItem('geoInfo');
    if (cachedGeo) {
      try {
        setGeo(JSON.parse(cachedGeo));
      } catch (error) {
        console.error('Failed to parse cached geo info:', error);
      }
    }

    // 只有当没有缓存时才请求
    if (!cachedGeo) {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          const geoData = { city: data.city, country: data.country_name, ip: data.ip };
          setGeo(geoData);
          // 缓存地理位置信息，有效期24小时
          localStorage.setItem('geoInfo', JSON.stringify(geoData));
          localStorage.setItem('geoInfoExpiry', String(Date.now() + 24 * 60 * 60 * 1000));
        })
        .catch(() => setGeo({ city: 'Unknown', country: 'Global' }));
    } else {
      // 检查缓存是否过期
      const expiry = localStorage.getItem('geoInfoExpiry');
      if (expiry && Date.now() > parseInt(expiry)) {
        localStorage.removeItem('geoInfo');
        localStorage.removeItem('geoInfoExpiry');
      }
    }
  }, []);

  const runCheck = useCallback(async () => {
    if (!auth.currentUser) return;
    
    setIsChecking(true);
    try {
      const res = await fetch('/api/check');
      const results: ApiStatus[] = await res.json();
      
      for (const result of results) {
        await setDoc(doc(db, 'api_status', result.id), result);
        await addDoc(collection(db, 'status_history'), {
          apiId: result.id,
          status: result.status,
          latency: result.latency,
          timestamp: serverTimestamp(),
        });

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
