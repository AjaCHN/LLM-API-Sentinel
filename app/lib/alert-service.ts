// app/lib/alert-service.ts v2.9.0

import { supabase } from './supabase';
import { useAlertStore } from '../store';
import type { ApiStatus } from '../types';
import { LATENCY_THRESHOLD } from '../constants';
import { logError } from './error-handler';
import { sendAlert } from './notification';

/** 根据检测结果判定是否需要创建告警，并在需要时落库 + 发送通知 */
export async function createAlertForResult(result: ApiStatus): Promise<void> {
  // 服务降级: 如果 API 离线或延迟超过阈值，创建告警
  if (result.status === 'offline' || result.latency > LATENCY_THRESHOLD) {
    const severity = result.status === 'offline' ? 'critical' : 'high';
    const message =
      result.status === 'offline'
        ? `API ${result.name} is offline`
        : `API ${result.name} latency is high (${result.latency}ms > ${LATENCY_THRESHOLD}ms)`;

    try {
      // 先查是否已存在未解决的同类告警
      // 注意: alerts 真实列是 resolved(BOOLEAN)，非 status 字符串
      const { data: existing } = await supabase
        .from('alerts')
        .select('id')
        .eq('api_id', result.id)
        .eq('resolved', false)
        .limit(1);

      if (existing && existing.length > 0) return;

      const { error } = await supabase.from('alerts').insert({
        api_id: result.id,
        severity,
        message,
        resolved: false,
        timestamp: new Date().toISOString(),
      });

      if (error) {
        logError(error, 'Failed to create alert');
        return;
      }

      // 通过通知服务发送告警
      sendAlert({
        id: `notify-${result.id}-${Date.now()}`,
        apiId: result.id,
        apiName: result.name,
        type: result.status === 'offline' ? 'downtime' : 'latency',
        severity,
        message,
        timestamp: new Date(),
        resolved: false,
        latency: result.latency,
        error: result.error,
      }).catch((err) => logError(err, 'Failed to send notification'));
    } catch (err) {
      logError(err, 'Alert creation failed');
    }
  }
}

/** 解决指定告警，更新数据库与本地 store */
export async function resolveAlert(alertId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('alerts')
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', alertId);

    if (error) {
      logError(error, 'Failed to resolve alert');
      return;
    }
    useAlertStore.getState().resolveAlert(alertId);
  } catch (err) {
    logError(err, 'Failed to resolve alert');
  }
}
