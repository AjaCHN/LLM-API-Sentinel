// app/hooks/useAuth.ts v3.3.1
'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User, AuthError } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'auth/popup-closed-by-user') {
        console.warn('Login popup was closed by user before completion.');
      } else if (authError.code === 'auth/cancelled-popup-request') {
        console.warn('Multiple popup requests detected. Previous one cancelled.');
      } else {
        console.error('Authentication error:', authError.code, authError.message);
        if (typeof window !== 'undefined' && window.parent !== window) {
          console.info('Tip: If login fails in the preview iframe, try opening the app in a new tab.');
        }
      }
    }
  };

  const logout = () => signOut(auth);

  return { user, login, logout };
}
