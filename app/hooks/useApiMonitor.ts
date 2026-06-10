// app/hooks/useApiMonitor.ts v2.6.3
// 改进：使用本地 API 检查，同时支持从 Supabase 同步数据
import { useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApiStore, useAuthStore } from '../store';
import { LATENCY_THRESHOLD, APIS_TO_CHECK } from '../constants';
import { ApiStatus, StatusHistory } from '../types';
import { logError, handleError } from '../lib/error-handler';
import { performCheck } from '../lib/monitor';
import { sendAlert } from '../lib/notification';

export function useApiMonitor() {
  const { 
    statuses, 
    history, 
    isChecking, 
    setIsChecking, 
    setLastUpdate,
    setStatuses,
    addHistoryEntry
  } = useApiStore();
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
      
      // 更新状态
      setStatuses(results.sort((a, b) => a.name.localeCompare(b.name)));
      setLastUpdate(new Date());

      // 添加到历史记录
      for (const result of results) {
        const historyEntry: StatusHistory = {
          id: `${result.id}-${Date.now()}`,
          apiId: result.id,
          status: result.status,
          latency: result.latency,
          time: new Date().toLocaleTimeString(),
          timestamp: new Date()
        };
        addHistoryEntry(historyEntry);
      }

      // 对每个 API 状态检查是否需要创建告警
      for (const result of results) {
        await checkAndCreateAlert(result);
      }

      // 尝试同步到 Supabase（可选）
      try {
        await syncToSupabase(results);
      } catch (err) {
        // 如果 Supabase 同步失败，只记录错误，不影响用户体验
        logError(err, 'Supabase sync failed');
      }

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
          const mockData = APIS_TO_CHECK.map((api: any) => ({
            ...api,
            status: Math.random() > 0.1 ? 'online' : 'offline',
            latency: Math.floor(Math.random() * 1000) + 50,
            lastChecked: new Date().toISOString(),
            errorRate: Math.floor(Math.random() * 5),
            availability: 95 + Math.floor(Math.random() * 5),
            uptime: 99.5 + Math.random() * 0.5,
            averageLatency: Math.floor(Math.random() * 800) + 100,
            maxLatency: Math.floor(Math.random() * 2000) + 1000,
            minLatency: Math.floor(Math.random() * 200) + 20
          }));
          setStatuses(mockData);
        }
      } catch {
        // 如果 Supabase 加载失败，生成模拟数据
        const mockData = APIS_TO_CHECK.map((api: any) => ({
          ...api,
          status: Math.random() > 0.1 ? 'online' : 'offline',
          latency: Math.floor(Math.random() * 1000) + 50,
          lastChecked: new Date().toISOString(),
          errorRate: Math.floor(Math.random() * 5),
          availability: 95 + Math.floor(Math.random() * 5),
          uptime: 99.5 + Math.random() * 0.5,
          averageLatency: Math.floor(Math.random() * 800) + 100,
          maxLatency: Math.floor(Math.random() * 2000) + 1000,
          minLatency: Math.floor(Math.random() * 200) + 20
        }));
        setStatuses(mockData);
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
