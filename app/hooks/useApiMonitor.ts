                                                            // app/hooks/useApiMonitor.ts v2.7.2
// 改进：使用本地 API 检查，同时支持从 Supabase 同步数据
import { useCallback, useEffect, startTransition } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { supabase } from '../lib/supabase';
import { useApiStore, useAuthStore } from '../store';
import { ApiStatus, StatusHistory } from '../types';
import { logError, handleError } from '../lib/error-handler';
import { performCheck } from '../lib/monitor';
import { generateMockApiStatuses } from '../lib/mock-data';
import {
  toApiStatusUpsert,
  toStatusHistoryInsert,
  fromApiStatusRow,
} from '../lib/supabase-mapping';
import { createAlertForResult } from '../lib/alert-service';

export function useApiMonitor() {
  const {
    statuses,
    history,
    isChecking,
    setIsChecking,
    setLastUpdate,
    setStatuses,
    addHistoryEntry,
  } = useApiStore(
    useShallow((state) => ({
      statuses: state.statuses,
      history: state.history,
      isChecking: state.isChecking,
      setIsChecking: state.setIsChecking,
      setLastUpdate: state.setLastUpdate,
      setStatuses: state.setStatuses,
      addHistoryEntry: state.addHistoryEntry,
    }))
  );
  const { setError } = useAuthStore();

  // 同步 API 状态到 Supabase
  const syncToSupabase = useCallback(async (results: ApiStatus[]) => {
    try {
      const { error: upsertError } = await supabase
        .from('api_status')
        .upsert(toApiStatusUpsert(results), { onConflict: 'id' });

      if (upsertError) {
        throw upsertError;
      }

      const { error: historyError } = await supabase
        .from('status_history')
        .insert(toStatusHistoryInsert(results));

      if (historyError) {
        logError(historyError, 'Failed to insert history records');
      }
    } catch (err) {
      logError(err, 'Failed to sync to Supabase');
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
        setStatuses(results.sort((a, b) => a.name.localeCompare(b.name)));
        setLastUpdate(new Date());
      });

      // 添加到历史记录
      const historyEntries: StatusHistory[] = results.map((result) => ({
        id: `${result.id}-${Date.now()}`,
        apiId: result.id,
        status: result.status,
        latency: result.latency,
        time: new Date().toLocaleTimeString(),
        timestamp: new Date(),
      }));
      addHistoryEntry(historyEntries);

      // 性能优化: 并行执行告警检查 (使用 Promise.all)
      Promise.all(results.map((result) => createAlertForResult(result))).catch((err) =>
        logError(err, 'Alert checks failed')
      );

      // 性能优化: 使用 requestIdleCallback 延迟非关键工作到浏览器空闲时执行
      const syncInIdle = () => {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() =>
            syncToSupabase(results).catch((err) => logError(err, 'Supabase sync failed'))
          );
        } else {
          setTimeout(
            () => syncToSupabase(results).catch((err) => logError(err, 'Supabase sync failed')),
            1000
          );
        }
      };
      syncInIdle();
    } catch (err) {
      logError(err, 'Check failed');
      setError(handleError(err).message);
    } finally {
      setIsChecking(false);
    }
  }, [
    setIsChecking,
    setLastUpdate,
    setError,
    setStatuses,
    addHistoryEntry,
    syncToSupabase,
  ]);

  // 初始化时尝试从 Supabase 加载（可选），否则使用本地模拟数据
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { data, error } = await supabase.from('api_status').select('*');

        if (error) throw error;

        if (data && data.length > 0) {
          const mappedData: ApiStatus[] = data.map((doc) => fromApiStatusRow(doc as Record<string, unknown>));
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
    runCheck,
  };
}
