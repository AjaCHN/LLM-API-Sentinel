'use client';

import React, { useMemo } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
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

  const getStatusColor = (status: string) => {
    if (status === 'online') return 'text-success';
    if (status === 'degraded') return 'text-warning';
    return 'text-error';
  };

  const getStatusBg = (status: string) => {
    if (status === 'online') return 'bg-success/10';
    if (status === 'degraded') return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getLatencyColor = (latency: number, status: string) => {
    if (status === 'offline') return 'bg-error';
    if (status === 'degraded') return 'bg-warning';
    if (latency > LATENCY_THRESHOLD) return 'bg-warning';
    return 'bg-success';
  };

  let cardIndex = 0;

  return (
    <div id="api-cards-container" className="space-y-12">
      {providers.length > 0 ? (
        providers.map((provider) => (
          <div key={provider} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold">{provider}</h3>
              <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-xl">
                {statusesByProvider[provider].length} APIs
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {statusesByProvider[provider].map((api) => {
                const staggerClass = `stagger-${(cardIndex % 8) + 1}`;
                cardIndex++;
                return (
                  <div 
                    key={api.id} 
                    id={`api-card-${api.id}`} 
                    className={cn(
                      'apple-card bg-card rounded-3xl p-6 border border-border/20 opacity-0 animate-fade-in-up',
                      api.status === 'offline' && 'border-error/30',
                      api.status === 'degraded' && 'border-warning/30',
                      staggerClass
                    )}
                  >
                    {api.status === 'offline' && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-error rounded-l-3xl" />
                    )}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h4 className="text-lg font-semibold">{api.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{api.provider}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-2.5 h-2.5 rounded-full status-dot',
                          api.status === 'online' ? 'bg-success' :
                          api.status === 'degraded' ? 'bg-warning' : 'bg-error',
                          api.status === 'offline' && 'animate-pulse-gentle'
                        )} />
                        <span className={cn(
                          'text-xs font-medium',
                          getStatusColor(api.status)
                        )}>
                          {api.status === 'online' ? t('api.online') :
                           api.status === 'degraded' ? t('api.degraded') : t('api.offline')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-muted-foreground">{t('api.latency')}</span>
                          <span className={cn(
                            'text-xl font-semibold',
                            api.latency >= LATENCY_THRESHOLD && api.status !== 'offline' ? 'text-warning' :
                            api.status === 'offline' ? 'text-error' : 'text-foreground'
                          )}>
                            {api.status === 'offline' ? t('api.timeout') : `${api.latency}ms`}
                          </span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              'h-full rounded-full transition-all duration-700 ease-out',
                              getLatencyColor(api.latency, api.status)
                            )}
                            style={{ 
                              width: api.status === 'offline' ? '100%' : `${Math.min((api.latency / LATENCY_THRESHOLD) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>

                      {(api.errorRate !== undefined || api.availability !== undefined) && (
                        <div className="grid grid-cols-2 gap-3">
                          {api.errorRate !== undefined && (
                            <div className={cn(
                              'rounded-2xl p-4',
                              api.errorRate > 1 ? 'bg-warning/10' : 'bg-secondary'
                            )}>
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span className="uppercase tracking-wide">{t('api.errorRate')}</span>
                                <span className={cn(
                                  'font-semibold',
                                  api.errorRate > 1 ? 'text-warning' : 'text-foreground'
                                )}>{api.errorRate}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-warning rounded-full"
                                  style={{ width: `${Math.min(api.errorRate, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {api.availability !== undefined && (
                            <div className="bg-secondary rounded-2xl p-4">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span className="uppercase tracking-wide">{t('api.availability')}</span>
                                <span className="font-semibold text-foreground">{api.availability}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-success rounded-full"
                                  style={{ width: `${api.availability}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {api.status === 'offline' && (
                        <div className="bg-error/10 rounded-2xl p-4">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">{t('api.retries')}</p>
                          <p className="text-lg font-semibold text-error">{api.retries || 2} {t('api.times')}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/20 pt-4 mt-5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t('api.lastChecked')}: {new Date(api.lastChecked).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      {api.retries && api.retries > 0 && api.status !== 'offline' && (
                        <div className={cn(
                          'flex items-center gap-1.5 px-3 py-1 rounded-full',
                          getStatusBg(api.status)
                        )}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="font-medium">{api.retries} {t('api.retries')}</span>
                        </div>
                      )}
                      {api.status === 'offline' && (
                        <span className={cn(
                          'flex items-center gap-1 px-2.5 py-1 rounded-full',
                          getStatusBg('offline')
                        )}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                          </svg>
                          {t('api.needsAttention')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div className="w-full border border-dashed border-border/40 p-12 md:p-20 text-center rounded-3xl bg-card/30">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="text-muted-foreground">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a9 9 0 0 1-8.73-9 9 9 0 0 1 15.66-3"/>
            </svg>
          </div>
          <h3 className="mt-8 text-2xl font-semibold">{t('api.noApiConfigured')}</h3>
          <p className="mt-4 text-base text-muted-foreground max-w-md mx-auto">
            {t('api.addApiHint')}
          </p>
        </div>
      )}
    </div>
  );
}