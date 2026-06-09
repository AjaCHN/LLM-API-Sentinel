// app/hooks/useDashboardData.ts v2.6.2
'use client';

import { useApiStore } from '../store';
import { useGeoLocation } from './useGeoLocation';
import { useApiMonitor } from './useApiMonitor';
import { useAlerts } from './useAlerts';
import { useAuth } from './useAuth';

export function useDashboardData() {
  // 使用专注的钩子
  const { geo } = useGeoLocation();
  const { statuses, history, isChecking, runCheck } = useApiMonitor();
  const { alerts, resolveAlert } = useAlerts();
  const { user, login, logout } = useAuth();

  const { lastUpdate } = useApiStore();

  return { 
    statuses, 
    history, 
    alerts, 
    user, 
    isChecking, 
    lastUpdate, 
    geo, 
    runCheck, 
    resolveAlert, 
    login, 
    logout 
  };
}
