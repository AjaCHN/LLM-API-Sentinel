// app/components/ApiStatusGrid.tsx v2.4.0
'use client';

import React, { memo } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '../lib/utils';

const LATENCY_THRESHOLD = 1500;

export interface ApiStatus {
  id: string;
  name: string;
  provider: string;
  url: string;
  status: 'online' | 'offline';
  latency: number;
  lastChecked: string;
  error?: string;
  retries?: number;
}

function ApiStatusGrid({ statuses }: { statuses: ApiStatus[] }) {
  const t = useTranslations();

  return (
    <div id="api-cards-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {statuses.length > 0 ? statuses.map((api) => (
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
              <span className="text-[10px] font-mono opacity-50 uppercase">{t('status.title')}</span>
              <span className={cn(
                "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
                api.status === 'online' ? (api.latency > LATENCY_THRESHOLD ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500") : "bg-rose-500/10 text-rose-500"
              )}>
                {api.status === 'online' && api.latency > LATENCY_THRESHOLD ? 'degraded' : api.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono opacity-50 uppercase">{t('apiStatus.latency')}</span>
              <span className={cn(
                "text-xs font-mono font-bold",
                api.latency > LATENCY_THRESHOLD ? "text-amber-500" : ""
              )}>{api.latency}ms</span>
            </div>
          </div>
        </div>
      )) : (
        <div className="col-span-full border border-dashed border-border/30 p-12 text-center rounded-lg">
          <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">{t('alerts.noAlerts')}</p>
        </div>
      )}
    </div>
  );
}

export default memo(ApiStatusGrid);
