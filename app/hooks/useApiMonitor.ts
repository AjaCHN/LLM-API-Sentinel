                                                            // app/hooks/useApiMonitor.ts v2.10.18
// 改进：使用本地 API 检查，同时支持从 Supabase 同步数据
import { useCallback, useEffect, startTransition } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useApiStore, useAuthStore, useErrorStore } from '../store';
import { ApiStatus, StatusHistory } from '../types';
import { logError, handleError } from '../lib/error-handler';
import { performCheck } from '../lib/monitor';
import { CHECK_INTERVAL } from '../constants';
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
  const { showError } = useErrorStore();

  // 同步 API 状态到 Supabase
  const syncToSupabase = useCallback(async (results: ApiStatus[]) => {
    // 未配置 Supabase 时不发起同步请求
    if (!isSupabaseConfigured) return;
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
      showError(handleError(err));
    } finally {
      setIsChecking(false);
    }
  }, [
    setIsChecking,
    setLastUpdate,
    showError,
    setStatuses,
    addHistoryEntry,
    syncToSupabase,
  ]);

  // 初始化时尝试从 Supabase 加载（可选，仅取已持久化的真实探测记录）；
  // 无论是否配置 Supabase，均自动执行一次主动真实探测，保证页面加载即有真实数据。
  useEffect(() => {
    const loadInitialData = async () => {
      // 未配置 Supabase 时不再注入模拟数据，保持空态等待真实探测结果
      if (!isSupabaseConfigured) {
        return;
      }
      try {
        const { data, error } = await supabase.from('api_status').select('*');

        if (error) throw error;

        if (data && data.length > 0) {
          const mappedData: ApiStatus[] = data.map((doc) => fromApiStatusRow(doc as Record<string, unknown>));
          setStatuses(mappedData.sort((a, b) => a.name.localeCompare(b.name)));
        }
        // Supabase 中无数据时不生成模拟数据，交由下方 runCheck 进行真实探测
      } catch {
        // Supabase 加载失败时保持空态，交由 runCheck 进行真实探测
      }
    };

    if (statuses.length === 0) {
      loadInitialData();
      // 自动执行一次主动探测，保证访客也能立即看到真实 API 状态
      runCheck();
    }
    // 仅在首次挂载时自动探测一次
  }, [statuses.length, setStatuses, runCheck]);

  // 定时自动巡检：按 CHECK_INTERVAL 周期刷新所有 API 状态，使仪表盘数据保持鲜活
  useEffect(() => {
    const timer = setInterval(() => {
      runCheck();
    }, CHECK_INTERVAL);
    return () => clearInterval(timer);
  }, [runCheck]);

  return {
    statuses,
    history,
    isChecking,
    runCheck,
  };
}
