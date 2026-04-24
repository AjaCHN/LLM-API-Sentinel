// app/hooks/useAuth.ts v2.5.0
import { useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuthStore } from '../store/auth';
import { logError, handleError } from '../lib/error';

export function useAuth() {
  const { user, setUser, setError } = useAuthStore();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribeAuth();
  }, [setUser]);

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

  return { user, login, logout };
}
