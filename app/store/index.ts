// app/store/index.ts v2.4.3
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApiStatus, StatusHistory, Alert } from '../types';

export interface ApiStatusState {
  // 状态数据
  statuses: ApiStatus[];
  history: StatusHistory[];
  alerts: Alert[];
  isChecking: boolean;
  lastUpdate: Date | null;
  geo: any | null;
  
  // 状态更新方法
  setStatuses: (statuses: ApiStatus[]) => void;
  setHistory: (history: StatusHistory[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setIsChecking: (isChecking: boolean) => void;
  setLastUpdate: (lastUpdate: Date | null) => void;
  setGeo: (geo: any | null) => void;
  
  // 操作方法
  clearAlerts: () => void;
  addHistoryEntry: (entry: StatusHistory) => void;
  updateApiStatus: (apiId: string, status: Partial<ApiStatus>) => void;
}

export const useApiStore = create<ApiStatusState>()(
  persist(
    (set) => ({
      // 初始状态
      statuses: [],
      history: [],
      alerts: [],
      isChecking: false,
      lastUpdate: null,
      geo: null,
      
      // 状态更新方法
      setStatuses: (statuses) => set({ statuses }),
      setHistory: (history) => set({ history }),
      setAlerts: (alerts) => set({ alerts }),
      setIsChecking: (isChecking) => set({ isChecking }),
      setLastUpdate: (lastUpdate) => set({ lastUpdate }),
      setGeo: (geo) => set({ geo }),
      
      // 操作方法
      clearAlerts: () => set({ alerts: [] }),
      addHistoryEntry: (entry) => set((state) => ({
        history: [...state.history, entry].slice(-100) // 只保留最近100条记录
      })),
      updateApiStatus: (apiId, status) => set((state) => ({
        statuses: state.statuses.map(api => 
          api.id === apiId ? { ...api, ...status } : api
        )
      })),
    }),
    {
      name: 'api-status-storage',
      partialize: (state) => ({
        statuses: state.statuses,
        geo: state.geo
      }),
    }
  )
);
