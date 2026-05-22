// app/hooks/useAlerts.ts v2.5.1
import { useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAlertStore, useAuthStore } from '../store';
import { Alert } from '../types';
import { logError, handleError } from '../lib/error';

export function useAlerts() {
  const { alerts, setAlerts } = useAlertStore();
  const { setError } = useAuthStore();

  useEffect(() => {
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
        setError(handleError(error).message);
      }
    });

    return () => {
      unsubscribeAlerts();
    };
  }, [setAlerts, setError]);

  const resolveAlert = async (id: string) => {
    try {
      await updateDoc(doc(db, 'alerts', id), { resolved: true });
    } catch (error) {
      logError(error, 'Failed to resolve alert');
      setError(handleError(error).message);
    }
  };

  return { alerts, resolveAlert };
}
