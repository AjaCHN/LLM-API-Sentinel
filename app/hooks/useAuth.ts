// app/hooks/useAuth.ts v2.9.8
import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { logError, handleError } from '../lib/error-handler';

export function useAuth() {
  const { user, setUser, setError } = useAuthStore();

  useEffect(() => {
    // 未配置 Supabase 时不加载会话与订阅，避免向占位端点报错
    if (!isSupabaseConfigured) return;

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            uid: session.user.id,
            displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email ?? null,
            photoURL: session.user.user_metadata?.avatar_url || null,
            providerId: session.user.app_metadata?.provider || 'email'
          });
        }
      } catch (error) {
        logError(error, 'Failed to get initial session');
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          uid: session.user.id,
          displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email ?? null,
          photoURL: session.user.user_metadata?.avatar_url || null,
          providerId: session.user.app_metadata?.provider || 'email'
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  const login = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
        }
      });
      if (error) throw error;
    } catch (error) {
      logError(error, 'Login failed');
      setError(handleError(error).message);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      logError(error, 'Logout failed');
      setError(handleError(error).message);
    }
  };

  return { user, login, logout };
}
