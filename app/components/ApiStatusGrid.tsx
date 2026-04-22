// app/components/ApiStatusGrid.tsx v2.4.2
'use client';

import React, { memo } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
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
  // 按提供商分组
  const statusesByProvider = statuses.reduce((acc, api) => {
    if (!acc[api.provider]) {
      acc[api.provider] = [];
    }
    acc[api.provider].push(api);
    return acc;
  }, {} as Record<string, ApiStatus[]>);

  // 获取所有提供商并排序
  const providers = Object.keys(statusesByProvider).sort();

  return (
    <div id="api-cards-container">
      {statuses.length > 0 ? (
        providers.map(provider => (
          <div key={provider} className="mb-8">
            <h3 className="text-xs font-mono uppercase opacity-50 tracking-widest mb-4">{provider}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {statusesByProvider[provider].map((api) => (
                <div key={api.id} id={`api-card-${api.id}`} className="sentinel-card group cursor-default rounded-lg bg-card text-card-foreground border border-border/30 transition-all hover:shadow-sm">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-base leading-tight">{api.name}</h4>
                      <div className="flex items-center">
                        {api.status === 'online' ? (
                          api.latency > LATENCY_THRESHOLD ? (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <span className="text-xs font-bold text-amber-500">Degraded</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <ShieldCheck className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs font-bold text-emerald-500">Available</span>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center gap-1">
                            <ShieldAlert className="w-4 h-4 text-rose-500" />
                            <span className="text-xs font-bold text-rose-500">Unavailable</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono opacity-50 uppercase">Latency</span>
                        <span className={cn(
                          "text-xs font-mono font-bold",
                          api.latency > LATENCY_THRESHOLD ? "text-amber-500" : ""
                        )}>{api.latency}ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono opacity-50 uppercase">Last Check</span>
                        <span className="text-xs font-mono">{new Date(api.lastChecked).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="border border-dashed border-border/30 p-12 text-center rounded-lg">
          <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">No data available</p>
        </div>
      )}
    </div>
  );
}

export default memo(ApiStatusGrid);
