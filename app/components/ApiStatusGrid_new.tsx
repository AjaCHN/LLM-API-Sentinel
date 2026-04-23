// app/components/ApiStatusGrid.tsx v2.5.0
'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, BarChart3, Clock, Server } from 'lucide-react';
import { cn } from '../lib/utils';
import { LATENCY_THRESHOLD } from '../constants';
import { ApiStatus } from '../types';

export default function ApiStatusGrid({ statuses }: { statuses: ApiStatus[] }) {
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
    <div id="api-cards-container" className="space-y-6">
      {providers.length > 0 ? (
        providers.map((provider) => (
          <div key={provider} className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{provider}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {statusesByProvider[provider].map((api) => (
                <div 
                  key={api.id} 
                  id={`api-card-${api.id}`} 
                  className="sentinel-card group cursor-default rounded-lg bg-card text-card-foreground border border-border/20 hover:border-border/50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-base md:text-lg leading-tight">{api.name}</h3>
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
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-t border-border/10 pt-2">
                        <span className="text-[10px] font-mono opacity-50 uppercase">Status</span>
                        <span className={cn(
                          "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full",
                          api.status === 'online' ? (api.latency > LATENCY_THRESHOLD ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500") : "bg-rose-500/10 text-rose-500"
                        )}>
                          {api.status === 'online' && api.latency > LATENCY_THRESHOLD ? 'degraded' : api.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 opacity-50" />
                          <span className="text-[10px] font-mono opacity-50 uppercase">Latency</span>
                        </div>
                        <span className={cn(
                          "text-xs font-mono font-bold",
                          api.latency > LATENCY_THRESHOLD ? "text-amber-500" : ""
                        )}>{api.latency}ms</span>
                      </div>
                      {api.errorRate !== undefined && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 opacity-50" />
                            <span className="text-[10px] font-mono opacity-50 uppercase">Error Rate</span>
                          </div>
                          <span className={cn(
                            "text-xs font-mono font-bold",
                            api.errorRate > 5 ? "text-amber-500" : api.errorRate > 10 ? "text-rose-500" : ""
                          )}>{api.errorRate.toFixed(1)}%</span>
                        </div>
                      )}
                      {api.availability !== undefined && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-1">
                            <Server className="w-3 h-3 opacity-50" />
                            <span className="text-[10px] font-mono opacity-50 uppercase">Availability</span>
                          </div>
                          <span className={cn(
                            "text-xs font-mono font-bold",
                            api.availability < 99 ? "text-amber-500" : api.availability < 95 ? "text-rose-500" : "text-emerald-500"
                          )}>{api.availability.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full border border-dashed border-border/30 p-16 text-center rounded-lg">
          <div className="mb-4">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground" />
          </div>
          <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">No API status data available</p>
          <p className="text-sm text-muted-foreground mt-2">Please check back later for API status updates</p>
        </div>
      )}
    </div>
  );
}
