// app/hooks/useDashboardData.ts v3.3.1
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, limit, setDoc, doc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { useAuth } from './useAuth';
import { useTasks } from './useTasks';

const LATENCY_THRESHOLD = 1500;

export function useDashboardData() {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [geo, setGeo] = useState<any | null>(null);

  const { user, login, logout } = useAuth();
  const { tasks, addTask, updateTaskStatus, deleteTask } = useTasks(user);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setGeo({ city: data.city, country: data.country_name, ip: data.ip }))
      .catch(() => setGeo({ city: 'Unknown', country: 'Global' }));
  }, []);

  const runCheck = useCallback(async () => {
    if (!user) return;
    
    setIsChecking(true);
    try {
      const res = await fetch('/api/check');
      const results: any[] = await res.json();
      
      for (const result of results) {
        try {
          await setDoc(doc(db, 'api_status', result.id), result);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `api_status/${result.id}`);
        }

        try {
          await addDoc(collection(db, 'status_history'), {
            apiId: result.id,
            status: result.status,
            latency: result.latency,
            throughput: result.throughput,
            timestamp: serverTimestamp(),
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, 'status_history');
        }

        if (result.status === 'offline') {
          try {
            await addDoc(collection(db, 'alerts'), {
              apiId: result.id,
              apiName: result.name,
              type: 'downtime',
              message: `${result.name} is currently offline.`,
              timestamp: serverTimestamp(),
              resolved: false
            });
          } catch (e) {
            handleFirestoreError(e, OperationType.CREATE, 'alerts');
          }
        } else if (result.latency > LATENCY_THRESHOLD) {
          try {
            await addDoc(collection(db, 'alerts'), {
              apiId: result.id,
              apiName: result.name,
              type: 'latency',
              message: `${result.name} latency is high: ${result.latency}ms.`,
              timestamp: serverTimestamp(),
              resolved: false
            });
          } catch (e) {
            handleFirestoreError(e, OperationType.CREATE, 'alerts');
          }
        }
      }
    } catch (error) {
      console.error('Check failed:', error);
    } finally {
      setIsChecking(false);
    }
  }, [user]);

  useEffect(() => {
    const qStatus = query(collection(db, 'api_status'));
    const unsubscribeStatus = onSnapshot(qStatus, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setStatuses(data.sort((a, b) => a.name.localeCompare(b.name)));
      setLastUpdate(new Date());
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'api_status'));

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
          time: d.timestamp ? new Date(d.timestamp.toDate()).toLocaleTimeString() : '',
          timestamp: d.timestamp?.toDate()
        };
      }).reverse();
      setHistory(data);
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'status_history'));

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
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'alerts'));

    let interval: NodeJS.Timeout;
    if (user) {
      interval = setInterval(() => {
        runCheck();
      }, 5 * 60 * 1000);
    }

    return () => {
      unsubscribeStatus();
      unsubscribeHistory();
      unsubscribeAlerts();
      if (interval) clearInterval(interval);
    };
  }, [user, runCheck]);

  const resolveAlert = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'alerts', id), { resolved: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `alerts/${id}`);
    }
  };

  return { statuses, history, alerts, tasks, user, isChecking, lastUpdate, geo, runCheck, resolveAlert, addTask, updateTaskStatus, deleteTask, login, logout };
}

