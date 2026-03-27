// app/components/AlertsDropdown.tsx v2.4.0
'use client';

import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface Alert {
  id: string;
  apiId: string;
  apiName: string;
  type: 'downtime' | 'latency';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: any;
  resolved: boolean;
  error?: string;
  retries?: number;
  latency?: number;
}

export default function AlertsDropdown({ alerts, onClose, onResolve }: { alerts: Alert[], onClose: () => void, onResolve: (id: string) => void }) {
  // 根据严重程度获取颜色
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-rose-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div id="alerts-dropdown" className="absolute right-0 mt-2 w-72 sm:w-80 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
      <div className="p-3 border-b border-border flex justify-between items-center bg-muted/30">
        <span className="text-[10px] font-bold uppercase tracking-widest">Active Alerts</span>
        <button onClick={onClose} className="opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {alerts.length > 0 ? alerts.map(alert => (
          <div key={alert.id} className="p-3 border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
            <div className="flex gap-3">
              <div className={cn(
                "mt-0.5",
                getSeverityColor(alert.severity)
              )}>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[11px] font-bold leading-tight">{alert.message}</p>
                  <span className={cn(
                    "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded",
                    alert.severity === 'high' ? "bg-rose-500/10 text-rose-500" :
                    alert.severity === 'medium' ? "bg-amber-500/10 text-amber-500" :
                    "bg-blue-500/10 text-blue-500"
                  )}>
                    {alert.severity}
                  </span>
                </div>
                {alert.error && (
                  <p className="text-[9px] text-muted-foreground mb-1 line-clamp-2">
                    Error: {alert.error}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <div className="text-[9px] opacity-50 font-mono">
                    <span>{alert.timestamp ? format(alert.timestamp.toDate(), 'HH:mm:ss') : 'Just now'}</span>
                    {alert.retries && alert.retries > 0 && (
                      <span className="ml-2">Retries: {alert.retries}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => onResolve(alert.id)}
                    className="text-[9px] font-bold uppercase text-emerald-500 hover:underline"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="p-8 text-center opacity-30">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
            <p className="text-[10px] uppercase font-mono">All systems operational</p>
          </div>
        )}
      </div>
    </div>
  );
}
