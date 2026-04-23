// app/hooks/useDashboardData.ts v2.5.0
'use client';

import { useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, limit, setDoc, doc, addDoc, serverTimestamp, where, updateDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { format } from 'date-fns';
import { useApiStore } from '../store';
import { useAuthStore } from '../store/auth';
import { LATENCY_THRESHOLD, CHECK_INTERVAL, GEO_INFO_EXPIRY } from '../constants';
import { ApiStatus, StatusHistory, Alert } from '../types';
import { logError, handleError } from '../lib/error';
import { sendAlert } from '../lib/notification';

export function useDashboardData() {
  const {
    statuses, 
    history, 
    alerts, 
    isChecking, 
    lastUpdate, 
    geo,
    setStatuses, 
    setHistory, 
    setAlerts, 
    setIsChecking, 
    setLastUpdate, 
    setGeo
  } = useApiStore();

  const { user, setUser, setError } = useAuthStore();

  // 缓存地理位置信息，避免重复请求
  useEffect(() => {
    // 检查本地存储是否有缓存的地理位置信息
    const cachedGeo = localStorage.getItem('geoInfo');
    if (cachedGeo) {
      try {
        setGeo(JSON.parse(cachedGeo));
      } catch (error) {
        logError(error, 'Failed to parse cached geo info');
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
          localStorage.setItem('geoInfoExpiry', String(Date.now() + GEO_INFO_EXPIRY));
        })
        .catch(error => {
          logError(error, 'Failed to fetch geo info');
          setGeo({ city: 'Unknown', country: 'Global' });
        });
    } else {
      // 检查缓存是否过期
      const expiry = localStorage.getItem('geoInfoExpiry');
      if (expiry && Date.now() > parseInt(expiry)) {
        localStorage.removeItem('geoInfo');
        localStorage.removeItem('geoInfoExpiry');
      }
    }
  }, [setGeo]);

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
            const alertData = {
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

            const alertData = {
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
      setError(handleError(error));
    } finally {
      setIsChecking(false);
    }
  }, [setIsChecking, setError]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));
    
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

    const qAlerts = query(
      collection(db, 'alerts'),
      where('resolved', '==', false),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubscribeAlerts = onSnapshot(qAlerts, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Alert));
        setAlerts(data);
      } catch (error) {
        logError(error, 'Failed to update alerts');
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
      unsubscribeAuth();
      unsubscribeStatus();
      unsubscribeHistory();
      unsubscribeAlerts();
      if (interval) clearInterval(interval);
    };
  }, [user, runCheck, setUser, setStatuses, setHistory, setAlerts, setLastUpdate]);

  const resolveAlert = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'alerts', id), { resolved: true });
    } catch (error) {
      logError(error, 'Failed to resolve alert');
      setError(handleError(error));
    }
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      logError(error, 'Login failed');
      setError(handleError(error));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      logError(error, 'Logout failed');
      setError(handleError(error));
    }
  };

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
