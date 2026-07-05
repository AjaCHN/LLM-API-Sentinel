// app/store/store.ts v2.6.3
import { useApiStore } from './api';
import { useAuthStore } from './auth';
import { useAlertStore } from './alerts';
import { useGeoStore } from './geo';

// 导出所有 store 模块
export {
  useApiStore,
  useAuthStore,
  useAlertStore,
  useGeoStore
};
