// app/hooks/useDashboardData.ts v2.6.0
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, limit, setDoc, doc, addDoc, serverTimestamp, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { format } from 'date-fns';

const LATENCY_THRESHOLD = 1500;

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isTransient = errorMessage.includes('CANCELLED') || 
                      errorMessage.toLowerCase().includes('idle stream') ||
                      errorMessage.toLowerCase().includes('timeout');

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  
  // Only log to console if it's NOT a transient stream error
  if (!isTransient) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }

  // Only throw for critical errors that require system intervention (like security rules)
  if (errorMessage.toLowerCase().includes('permission') || 
      errorMessage.toLowerCase().includes('unauthenticated') ||
      errorMessage.toLowerCase().includes('quota')) {
    throw new Error(JSON.stringify(errInfo));
  }
}

export function useDashboardData() {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
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
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));
    
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
          time: d.timestamp ? format(d.timestamp.toDate(), 'HH:mm:ss') : '',
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

    let unsubscribeTasks = () => {};
    if (user) {
      const qTasks = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(data);
      }, (e) => handleFirestoreError(e, OperationType.LIST, 'tasks'));
    } else {
      setTasks([]);
    }

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
      unsubscribeTasks();
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

  const addTask = async (title: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'tasks'), {
        title,
        status: 'todo',
        createdAt: serverTimestamp(),
        userId: user.uid
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'tasks');
    }
  };

  const updateTaskStatus = async (id: string, status: 'todo' | 'inProgress' | 'done') => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'tasks', id), { status });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `tasks/${id}`);
    }
  };

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return { statuses, history, alerts, tasks, user, isChecking, lastUpdate, geo, runCheck, resolveAlert, addTask, updateTaskStatus, deleteTask, login, logout };
}

