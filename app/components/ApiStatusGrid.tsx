// app/components/ApiStatusGrid.tsx v2.6.0
'use client';

import React, { useMemo } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, BarChart3, Clock, Server } from 'lucide-react';
import { cn } from '../lib/utils';
import { LATENCY_THRESHOLD } from '../constants';
import { ApiStatus } from '../types';
import { useI18n } from '../hooks/useI18n';

export default function ApiStatusGrid({ statuses }: { statuses: ApiStatus[] }) {
  const { t } = useI18n();
  const statusesByProvider = useMemo(() => {
    return statuses.reduce((acc, api) => {
      if (!acc[api.provider]) {
        acc[api.provider] = [];
      }
      acc[api.provider].push(api);
      return acc;
    }, {} as Record<string, ApiStatus[]>);
  }, [statuses]);
  
  const providers = useMemo(() => Object.keys(statusesByProvider).sort(), [statusesByProvider]);

  const getProgressBarColor = (latency: number, status: string) => {
    if (status === 'offline') return 'bg-red-500';
    if (status === 'degraded') return 'bg-amber-500';
    if (latency > LATENCY_THRESHOLD) return 'bg-amber-500';
    return 'bg-primary';
  };

  return (
    <div id="api-cards-container" className="space-y-6">
      {providers.length > 0 ? (
        providers.map((provider) => (
          <div key={provider} className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{provider}</h2>
            <div 
              className="api-grid"
            >
              {statusesByProvider[provider].map((api) => (
                <div 
                  key={api.id} 
                  id={`api-card-${api.id}`} 
                  className="api-card-item group cursor-default rounded-lg bg-card text-card-foreground border border-border/20 hover:border-border/50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                          {api.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Server className="h-4 w-4" />
                          <span className="truncate max-w-[180px]">{api.url}</span>
                        </div>
                      </div>
                      <div 
                        className={cn(
                          'flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium',
                          api.status === 'online' 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : api.status === 'degraded'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        )}
                      >
                        {api.status === 'online' ? (
                          <>
                            <ShieldCheck className="h-3 w-3" />
                            <span>{t('api.online')}</span>
                          </>
                        ) : api.status === 'degraded' ? (
                          <>
                            <AlertTriangle className="h-3 w-3" />
                            <span>{t('api.degraded')}</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="h-3 w-3" />
                            <span>{t('api.offline')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t('api.latency')}</span>
                          <span 
                            className={cn(
                              'font-medium',
                              api.latency < LATENCY_THRESHOLD ? 'text-foreground' : 'text-amber-600'
                            )}
                          >
                            {api.latency}ms
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              'h-full rounded-full transition-all duration-500 ease-out',
                              getProgressBarColor(api.latency, api.status)
                            )}
                            style={{ 
                              width: `${Math.min((api.latency / LATENCY_THRESHOLD) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>

                      {api.errorRate !== undefined && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{t('api.errorRate')}</span>
                            <span className="font-medium text-foreground">
                              {api.errorRate}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${api.errorRate}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {api.availability !== undefined && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{t('api.availability')}</span>
                            <span className="font-medium text-foreground">
                              {api.availability}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${api.availability}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/20 pt-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>{t('api.lastChecked')}: {new Date(api.lastChecked).toLocaleString()}</span>
                      </div>
                      {api.retries && api.retries > 0 && (
                        <div className="flex items-center space-x-1 text-amber-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{api.retries} {t('api.retries')}</span>
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">{t('api.noApiConfigured')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('api.addApiHint')}
          </p>
        </div>
      )}
    </div>
  );
}