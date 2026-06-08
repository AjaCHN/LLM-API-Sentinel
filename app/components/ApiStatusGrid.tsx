// app/components/ApiStatusGrid.tsx v3.0.0 - Apple Style
'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, BarChart3, Clock } from 'lucide-react';
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
    <div id="api-cards-container" className="space-y-10">
      {providers.length > 0 ? (
        providers.map((provider) => (
          <div key={provider} className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{provider}</h3>
              <span className="text-xs font-medium text-muted-foreground">
                {statusesByProvider[provider].length} APIs
              </span>
            </div>
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {statusesByProvider[provider].map((api) => {
                const staggerClass = `stagger-${(cardIndex % 8) + 1}`;
                cardIndex++;
                return (
                  <div 
                    key={api.id} 
                    id={`api-card-${api.id}`} 
                    className={cn(
                      'apple-card bg-card border border-border/40 rounded-3xl p-6 opacity-0 animate-fade-in-up',
                      staggerClass
                    )}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h4 className="text-lg font-semibold">{api.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{api.provider}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-2.5 h-2.5 rounded-full status-dot',
                          api.status === 'online' ? 'bg-success' :
                          api.status === 'degraded' ? 'bg-warning' : 'bg-error'
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
                            api.latency >= LATENCY_THRESHOLD && api.status !== 'offline' ? 'text-warning' : 'text-foreground'
                          )}>
                            {api.status === 'offline' ? t('api.timeout') : `${api.latency}ms`}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
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
                        <div className="grid grid-cols-2 gap-4">
                          {api.errorRate !== undefined && (
                            <div className="bg-secondary rounded-2xl p-4">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span className="uppercase tracking-wide">{t('api.errorRate')}</span>
                                <span className="font-semibold text-foreground">{api.errorRate}%</span>
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
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-4 mt-6">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t('api.lastChecked')}: {new Date(api.lastChecked).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      {api.retries && api.retries > 0 && (
                        <div className={cn(
                          'flex items-center gap-1.5 px-3 py-1 rounded-full',
                          api.status === 'offline' ? getStatusBg('offline') : getStatusBg('degraded')
                        )}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="font-medium">{api.retries} {t('api.retries')}</span>
                        </div>
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
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
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