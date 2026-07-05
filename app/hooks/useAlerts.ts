// app/hooks/useAlerts.ts v2.6.3
import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAlertStore, useAuthStore } from '../store';
import { Alert } from '../types';
import { logError, handleError } from '../lib/error-handler';

export function useAlerts() {
  const { alerts, setAlerts } = useAlertStore();
  const { setError } = useAuthStore();

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .eq('resolved', false)
          .order('timestamp', { ascending: false })
          .limit(50);

        if (error) throw error;

        const mappedData: Alert[] = (data || []).map(doc => ({
          id: doc.id,
          apiId: doc.api_id,
          apiName: doc.api_name,
          type: doc.type,
          severity: doc.severity,
          message: doc.message,
          timestamp: new Date(doc.timestamp),
          resolved: doc.resolved,
          error: doc.error,
          retries: doc.retries,
          latency: doc.latency,
          resolvedAt: doc.resolved_at ? new Date(doc.resolved_at) : undefined,
          resolvedBy: doc.resolved_by
        }));
        setAlerts(mappedData);
      } catch (error) {
        logError(error, 'Failed to update alerts');
        setError(handleError(error).message);
      }
    };

    // Initial load
    loadAlerts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        () => {
          loadAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setAlerts, setError]);

  const resolveAlert = useCallback(async (id: string) => {
    // 乐观更新本地状态，避免等待实时订阅
    useAlertStore.getState().resolveAlert(id);
    try {
      const { error } = await supabase
        .from('alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      // 回滚本地乐观更新
      logError(error, 'Failed to resolve alert');
      setError(handleError(error).message);
      // 重新加载以恢复真实状态
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .eq('resolved', false)
        .order('timestamp', { ascending: false })
        .limit(50);
      const mappedData: Alert[] = (data || []).map(doc => ({
        id: doc.id,
        apiId: doc.api_id,
        apiName: doc.api_name,
        type: doc.type,
        severity: doc.severity,
        message: doc.message,
        timestamp: new Date(doc.timestamp),
        resolved: doc.resolved,
        error: doc.error,
        retries: doc.retries,
        latency: doc.latency,
        resolvedAt: doc.resolved_at ? new Date(doc.resolved_at) : undefined,
        resolvedBy: doc.resolved_by
      }));
      setAlerts(mappedData);
    }
  }, [setAlerts, setError]);

  return { alerts, resolveAlert };
}
