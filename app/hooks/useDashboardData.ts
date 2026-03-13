// app/hooks/useDashboardData.ts v2.1.0
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, limit, setDoc, doc, addDoc, serverTimestamp, where, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { format } from 'date-fns';

const LATENCY_THRESHOLD = 1500;

export function useDashboardData() {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [geo, setGeo] = useState<any | null>(null);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setGeo({ city: data.city, country: data.country_name, ip: data.ip }))
      .catch(() => setGeo({ city: 'Unknown', country: 'Global' }));
  }, []);

  const runCheck = useCallback(async () => {
    if (!auth.currentUser) return;
    
    setIsChecking(true);
    try {
      const res = await fetch('/api/check');
      const results: any[] = await res.json();
      
      for (const result of results) {
        await setDoc(doc(db, 'api_status', result.id), result);
        await addDoc(collection(db, 'status_history'), {
          apiId: result.id,
          status: result.status,
          latency: result.latency,
          throughput: result.throughput,
          timestamp: serverTimestamp(),
        });

        if (result.status === 'offline') {
          await addDoc(collection(db, 'alerts'), {
            apiId: result.id,
            apiName: result.name,
            type: 'downtime',
            message: `${result.name} is currently offline.`,
            timestamp: serverTimestamp(),
            resolved: false
          });
        } else if (result.latency > LATENCY_THRESHOLD) {
          await addDoc(collection(db, 'alerts'), {
            apiId: result.id,
            apiName: result.name,
            type: 'latency',
            message: `${result.name} latency is high: ${result.latency}ms.`,
            timestamp: serverTimestamp(),
            resolved: false
          });
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
      const data = snapshot.docs.map(doc => doc.data());
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
        };
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
      }));
      setAlerts(data);
    });

    let interval: NodeJS.Timeout;
    if (user) {
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

  const resolveAlert = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'alerts', id), { resolved: true });
  };

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return { statuses, history, alerts, user, isChecking, lastUpdate, geo, runCheck, resolveAlert, login, logout };
}
