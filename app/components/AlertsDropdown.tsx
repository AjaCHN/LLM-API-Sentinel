// app/components/AlertsDropdown.tsx v2.6.0
'use client';

import React from 'react';
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { Alert } from '../types';
import { useI18n } from '../hooks/useI18n';

export default function AlertsDropdown({
  alerts,
  show,
  onClose,
  resolveAlert
}: {
  alerts: Alert[];
  show: boolean;
  onClose: () => void;
  resolveAlert: (id: string) => void;
}) {
  const { t } = useI18n();
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider">{t('alerts.activeAlerts')}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('alerts.noActiveAlerts')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="border border-border rounded-md p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <AlertTriangle 
                        className={`w-4 h-4 ${alert.severity === 'high' ? 'text-rose-500' : alert.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'}`} 
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{alert.apiName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                      {alert.error && (
                        <p className="text-xs text-rose-500 mt-1">{t('alerts.error')}: {alert.error}</p>
                      )}
                      {alert.latency && (
                        <p className="text-xs text-muted-foreground mt-1">{t('alerts.latency')}: {alert.latency}ms</p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => resolveAlert(alert.id)}
                    className="text-xs font-bold uppercase text-emerald-500 hover:underline"
                  >
                    {t('alerts.resolve')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
