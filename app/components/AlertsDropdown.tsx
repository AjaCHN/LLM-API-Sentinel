// app/components/AlertsDropdown.tsx v2.3.0
'use client';

import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function AlertsDropdown({ alerts, onClose, onResolve }: { alerts: any[], onClose: () => void, onResolve: (id: string) => void }) {
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
                alert.type === 'downtime' ? "text-rose-500" : "text-amber-500"
              )}>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold leading-tight mb-1">{alert.message}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] opacity-50 font-mono">
                    {alert.timestamp ? format(alert.timestamp.toDate(), 'HH:mm:ss') : 'Just now'}
                  </span>
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
