// app/store/api.ts v2.6.3
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApiStatus, StatusHistory } from '../types';

export interface ApiStoreState {
  // 状态数据
  statuses: ApiStatus[];
  history: StatusHistory[];
  isChecking: boolean;
  lastUpdate: Date | null;
  
  // 状态更新方法
  setStatuses: (statuses: ApiStatus[]) => void;
  setHistory: (history: StatusHistory[]) => void;
  setIsChecking: (isChecking: boolean) => void;
  setLastUpdate: (lastUpdate: Date | null) => void;
  
  // 操作方法
  clearHistory: () => void;
  addHistoryEntry: (entry: StatusHistory | StatusHistory[]) => void;
  updateApiStatus: (apiId: string, status: Partial<ApiStatus>) => void;
  clearApiStatuses: () => void;
}

export const useApiStore = create<ApiStoreState>()(
  persist(
    (set) => ({
      // 初始状态
      statuses: [],
      history: [],
      isChecking: false,
      lastUpdate: null,
      
      // 状态更新方法
      setStatuses: (statuses) => set({ statuses }),
      setHistory: (history) => set({ history }),
      setIsChecking: (isChecking) => set({ isChecking }),
      setLastUpdate: (lastUpdate) => set({ lastUpdate }),
      
      // 操作方法
      clearHistory: () => set({ history: [] }),
      // 性能优化: 支持批量添加历史记录
      addHistoryEntry: (entryOrEntries) => set((state) => {
        const entries = Array.isArray(entryOrEntries) ? entryOrEntries : [entryOrEntries];
        return {
          history: [...state.history, ...entries].slice(-100) // 只保留最近100条记录
        };
      }),
      updateApiStatus: (apiId, status) => set((state) => ({
        statuses: state.statuses.map(api => 
          api.id === apiId ? { ...api, ...status } : api
        )
      })),
      clearApiStatuses: () => set({ statuses: [] }),
    }),
    {
      name: 'api-status-storage',
      partialize: (state) => ({
        statuses: state.statuses
      }),
    }
  )
);
