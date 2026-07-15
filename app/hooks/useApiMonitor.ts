// app/hooks/useApiMonitor.ts v2.7.0
// 改进：使用本地 API 检查，同时支持从 Supabase 同步数据
import { useCallback, useEffect, startTransition } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { supabase } from '../lib/supabase';
import { useApiStore, useAuthStore } from '../store';
import { LATENCY_THRESHOLD, APIS_TO_CHECK } from '../constants';
import { ApiStatus, StatusHistory } from '../types';
import { logError, handleError } from '../lib/error-handler';
import { performCheck } from '../lib/monitor';
import { sendAlert } from '../lib/notification';
import { generateMockApiStatuses } from '../lib/mock-data';

export function useApiMonitor() {
  const { 
    statuses, 
    history, 
    isChecking, 
    setIsChecking, 
    setLastUpdate,
    setStatuses,
    addHistoryEntry
  } = useApiStore(useShallow((state) => ({
    statuses: state.statuses,
    history: state.history,
    isChecking: state.isChecking,
    setIsChecking: state.setIsChecking,
    setLastUpdate: state.setLastUpdate,
    setStatuses: state.setStatuses,
    addHistoryEntry: state.addHistoryEntry,
  })));
  const { setError } = useAuthStore();

  // 同步 API 状态到 Supabase
  const syncToSupabase = useCallback(async (results: ApiStatus[]) => {
    try {
      const upsertData = results.map(result => ({
        id: result.id,
        name: result.name,
        provider: result.provider,
        url: result.url,
        status: result.status,
        latency: result.latency,
        last_checked: result.lastChecked,
        error: result.error || null,
        retries: result.retries || 0,
        error_rate: result.errorRate || 0,
        availability: result.availability || 100,
        uptime: result.uptime || 100,
        average_latency: result.averageLatency || null,
        max_latency: result.maxLatency || null,
        min_latency: result.minLatency || null,
        updated_at: new Date().toISOString()
      }));

      const { error: upsertError } = await supabase
        .from('api_status')
        .upsert(upsertData, { onConflict: 'id' });

      if (upsertError) {
        throw upsertError;
      }

      // 添加历史记录
      const historyData = results.map(result => ({
        api_id: result.id,
        status: result.status,
        latency: result.latency,
        error: result.error || null,
        retries: result.retries || 0,
        timestamp: new Date().toISOString()
      }));

      const { error: historyError } = await supabase
        .from('status_history')
        .insert(historyData);

      if (historyError) {
        logError(historyError, 'Failed to insert history records');
      }
    } catch (err) {
      logError(err, 'Failed to sync to Supabase');
    }
  }, []);

  // 智能告警检查函数
  const checkAndCreateAlert = useCallback(async (result: ApiStatus) => {
    try {
      // 检查是否已有未解决的同类告警
      const { data: existingAlerts } = await supabase
        .from('alerts')
        .select('id')
        .eq('api_id', result.id)
        .eq('type', result.status === 'offline' ? 'downtime' : 'latency')
        .eq('resolved', false)
        .limit(1);

      if (existingAlerts && existingAlerts.length > 0) {
        return; // 已有未解决的同类告警，跳过
      }

      if (result.status === 'offline') {
        const alertData = {
          api_id: result.id,
          api_name: result.name,
          type: 'downtime',
          severity: 'high',
          message: `${result.name} is currently offline.`,
          timestamp: new Date().toISOString(),
          resolved: false,
          error: result.error || null,
          retries: result.retries || 0
        };

        const { data, error } = await supabase
          .from('alerts')
          .insert(alertData)
          .select('id')
          .single();

        if (!error && data) {
          await sendAlert({
            id: data.id,
            apiId: result.id,
            apiName: result.name,
            type: 'downtime',
            severity: 'high',
            message: `${result.name} is currently offline.`,
            timestamp: new Date(),
            resolved: false,
            error: result.error,
            retries: result.retries
          });
        }
      } else if (result.latency > LATENCY_THRESHOLD) {
        let severity: 'low' | 'medium' | 'high' = 'medium';
        if (result.latency > LATENCY_THRESHOLD * 2) {
          severity = 'high';
        } else if (result.latency > LATENCY_THRESHOLD * 1.5) {
          severity = 'medium';
        } else {
          severity = 'low';
        }

        const alertData = {
          api_id: result.id,
          api_name: result.name,
          type: 'latency',
          severity,
          message: `${result.name} latency is high: ${result.latency}ms.`,
          timestamp: new Date().toISOString(),
          resolved: false,
          latency: result.latency
        };

        const { data, error } = await supabase
          .from('alerts')
          .insert(alertData)
          .select('id')
          .single();

        if (!error && data) {
          await sendAlert({
            id: data.id,
            apiId: result.id,
            apiName: result.name,
            type: 'latency',
            severity,
            message: `${result.name} latency is high: ${result.latency}ms.`,
            timestamp: new Date(),
            resolved: false,
            latency: result.latency
          });
        }
      }
    } catch (err) {
      logError(err, 'Failed to check and create alert');
    }
  }, []);

  // 主检查函数，使用本地 API 检查
  const runCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      // 执行本地 API 检查
      const results = await performCheck();
      
      // 性能优化: 使用 startTransition 标记非紧急更新，保持 UI 响应性
      startTransition(() => {
        // 更新状态
        setStatuses(results.sort((a, b) => a.name.localeCompare(b.name)));
        setLastUpdate(new Date());
      });

      // 添加到历史记录
      const historyEntries: StatusHistory[] = results.map(result => ({
        id: `${result.id}-${Date.now()}`,
        apiId: result.id,
        status: result.status,
        latency: result.latency,
        time: new Date().toLocaleTimeString(),
        timestamp: new Date()
      }));
      addHistoryEntry(historyEntries);

      // 性能优化: 并行执行告警检查 (使用 Promise.all)
      Promise.all(results.map(result => checkAndCreateAlert(result))).catch(err => 
        logError(err, 'Alert checks failed')
      );

      // 性能优化: 使用 requestIdleCallback 延迟非关键工作到浏览器空闲时执行
      const syncInIdle = () => {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => syncToSupabase(results).catch(err => 
            logError(err, 'Supabase sync failed')
          ));
        } else {
          setTimeout(() => syncToSupabase(results).catch(err => 
            logError(err, 'Supabase sync failed')
          ), 1000);
        }
      };
      syncInIdle();

    } catch (err) {
      logError(err, 'Check failed');
      setError(handleError(err).message);
    } finally {
      setIsChecking(false);
    }
  }, [setIsChecking, setLastUpdate, setError, setStatuses, addHistoryEntry, checkAndCreateAlert, syncToSupabase]);

  // 初始化时尝试从 Supabase 加载（可选），否则使用本地模拟数据
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { data, error } = await supabase
          .from('api_status')
          .select('*');

        if (error) throw error;

        if (data && data.length > 0) {
          const mappedData: ApiStatus[] = data.map(doc => ({
            id: doc.id,
            name: doc.name,
            provider: doc.provider,
            url: doc.url,
            status: doc.status,
            latency: doc.latency,
            lastChecked: doc.last_checked,
            error: doc.error,
            retries: doc.retries,
            errorRate: doc.error_rate,
            availability: doc.availability,
            uptime: doc.uptime,
            averageLatency: doc.average_latency,
            maxLatency: doc.max_latency,
            minLatency: doc.min_latency
          }));
          setStatuses(mappedData.sort((a, b) => a.name.localeCompare(b.name)));
        } else {
          // 如果 Supabase 中没有数据，生成模拟数据
          setStatuses(generateMockApiStatuses());
        }
      } catch {
        // 如果 Supabase 加载失败，生成模拟数据
        setStatuses(generateMockApiStatuses());
      }
    };

    if (statuses.length === 0) {
      loadInitialData();
    }
  }, [statuses.length, setStatuses]);

  return { 
    statuses, 
    history, 
    isChecking, 
    runCheck 
  };
}
