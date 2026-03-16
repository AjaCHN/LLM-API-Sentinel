// app/components/ApiStatusGrid.tsx v2.4.0
'use client';

import { ShieldCheck, ShieldAlert, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../lib/utils'; 

const LATENCY_THRESHOLD = 1500;

export default function ApiStatusGrid({ statuses, baselines }: { statuses: any[], baselines: Record<string, any> }) {
  return (
    <div id="api-cards-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {statuses.length > 0 ? statuses.map((api) => {
        const baseline = baselines[api.id];
        const latencyDiff = baseline ? api.latency - baseline.avgLatency : 0;
        
        return (
          <div key={api.id} id={`api-card-${api.id}`} className="sentinel-card group cursor-default rounded-lg bg-card text-card-foreground">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="mono-label">{api.provider}</p>
                <h3 className="font-bold text-base md:text-lg leading-tight">{api.name}</h3>
              </div>
              {api.status === 'online' ? (
                api.latency > LATENCY_THRESHOLD ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                )
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center border-t border-border/10 pt-2">
                <span className="text-[10px] font-mono opacity-50 uppercase">Status</span>
                <span className={cn(
                  "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
                  api.status === 'online' ? (api.latency > LATENCY_THRESHOLD ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500") : "bg-rose-500/10 text-rose-500"
                )}>
                  {api.status === 'online' && api.latency > LATENCY_THRESHOLD ? 'degraded' : api.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono opacity-50 uppercase">Latency</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-mono font-bold",
                    api.latency > LATENCY_THRESHOLD ? "text-amber-500" : ""
                  )}>{api.latency}ms</span>
                  {baseline && (
                    <span className={cn(
                      "text-[9px] font-bold flex items-center",
                      latencyDiff > 0 ? "text-rose-500" : "text-emerald-500"
                    )}>
                      {latencyDiff > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                      {Math.abs(latencyDiff).toFixed(0)}ms
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }) : (
        <div className="col-span-full border border-dashed border-border/30 p-12 text-center rounded-lg">
          <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">No data available.</p>
        </div>
      )}
    </div>
  );
}
