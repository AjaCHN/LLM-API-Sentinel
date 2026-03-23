// app/hooks/useTasks.ts v3.4.7
'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export function useTasks(user: User | null) {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribe = () => {};
    if (user) {
      const qTasks = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      unsubscribe = onSnapshot(qTasks, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(data);
      }, (e) => handleFirestoreError(e, OperationType.LIST, 'tasks'));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTasks([]);
    }
    return unsubscribe;
  }, [user]);

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

  return { tasks, addTask, updateTaskStatus, deleteTask };
}
