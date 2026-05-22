// app/store/store.ts v2.5.1
import { useApiStore } from './api';
import { useAuthStore } from './auth';
import { useAlertStore } from './alerts';
import { useGeoStore } from './geo';

// 根 store 组合所有模块
export function useStore() {
  return {
    api: useApiStore(),
    auth: useAuthStore(),
    alerts: useAlertStore(),
    geo: useGeoStore()
  };
}

// 导出所有 store 模块
export {
  useApiStore,
  useAuthStore,
  useAlertStore,
  useGeoStore
};
