// app/store/error.ts v2.6.3
import { create } from 'zustand';
import { AppError, Notification } from '../types';

export interface ErrorStoreState {
  // 状态数据
  error: AppError | null;
  notifications: Notification[];
  
  // 状态更新方法
  setError: (error: AppError | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // 操作方法
  showError: (error: AppError) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

export const useErrorStore = create<ErrorStoreState>()((set) => ({
  // 初始状态
  error: null,
  notifications: [],
  
  // 状态更新方法
  setError: (error) => set({ error }),
  addNotification: (notification) => set((state) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      duration: notification.duration || 5000,
      dismissible: notification.dismissible ?? true,
    };
    
    // 自动移除通知
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== newNotification.id)
      }));
    }, newNotification.duration);
    
    return {
      notifications: [newNotification, ...state.notifications].slice(0, 5) // 最多显示5个通知
    };
  }),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  clearNotifications: () => set({ notifications: [] }),
  
  // 操作方法
  showError: (error) => set((state) => ({
    error,
    notifications: [
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'error' as const,
        message: error.message,
        timestamp: Date.now(),
        duration: 5000,
        dismissible: true,
      } as Notification,
      ...state.notifications
    ].slice(0, 5)
  })),
  showSuccess: (message) => set((state) => ({
    notifications: [
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'success' as const,
        message,
        timestamp: Date.now(),
        duration: 3000,
        dismissible: true,
      } as Notification,
      ...state.notifications
    ].slice(0, 5)
  })),
  showWarning: (message) => set((state) => ({
    notifications: [
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'warning' as const,
        message,
        timestamp: Date.now(),
        duration: 4000,
        dismissible: true,
      } as Notification,
      ...state.notifications
    ].slice(0, 5)
  })),
  showInfo: (message) => set((state) => ({
    notifications: [
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'info' as const,
        message,
        timestamp: Date.now(),
        duration: 3000,
        dismissible: true,
      } as Notification,
      ...state.notifications
    ].slice(0, 5)
  })),
}));
