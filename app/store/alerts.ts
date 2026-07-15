// app/store/alerts.ts v2.7.0
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Alert } from '../types';

export interface AlertStoreState {
  // 状态数据
  alerts: Alert[];
  
  // 状态更新方法
  setAlerts: (alerts: Alert[]) => void;
  
  // 操作方法
  clearAlerts: () => void;
  addAlert: (alert: Alert) => void;
  resolveAlert: (alertId: string) => void;
  removeAlert: (alertId: string) => void;
}

export const useAlertStore = create<AlertStoreState>()(
  persist(
    (set) => ({
      // 初始状态
      alerts: [],
      
      // 状态更新方法
      setAlerts: (alerts) => set({ alerts }),
      
      // 操作方法
      clearAlerts: () => set({ alerts: [] }),
      addAlert: (alert) => set((state) => ({
        alerts: [alert, ...state.alerts].slice(0, 50) // 只保留最近50条告警
      })),
      resolveAlert: (alertId) => set((state) => ({
        alerts: state.alerts.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        )
      })),
      removeAlert: (alertId) => set((state) => ({
        alerts: state.alerts.filter(alert => alert.id !== alertId)
      })),
    }),
    {
      name: 'alerts-storage',
      partialize: () => ({
        // 不持久化告警，因为它们应该从数据库获取
        alerts: []
      }),
    }
  )
);
