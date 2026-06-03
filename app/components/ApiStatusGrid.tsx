// app/components/ApiStatusGrid.tsx v2.6.1
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

  const getProgressBarColor = (latency: number, status: string) => {
    if (status === 'offline') return 'bg-red-500';
    if (status === 'degraded') return 'bg-amber-500';
    if (latency > LATENCY_THRESHOLD) return 'bg-amber-500';
    return 'bg-green-500';
  };

  let cardIndex = 0;

  return (
    <div id="api-cards-container" className="space-y-6">
      {providers.length > 0 ? (
        providers.map((provider) => (
          <div key={provider} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{provider}</h3>
              <span className="text-xs font-mono opacity-50">
                {statusesByProvider[provider].length} APIs
              </span>
            </div>
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {statusesByProvider[provider].map((api) => {
                const animationDelay = `${cardIndex * 0.05}s`;
                cardIndex++;
                return (
                  <div 
                    key={api.id} 
                    id={`api-card-${api.id}`} 
                    className="group bg-card border border-border/20 hover:border-border/50 transition-all duration-300 shadow-sm hover:shadow-lg rounded-xl p-5 animate-fade-in relative overflow-hidden"
                    style={{ animationDelay }}
                  >
                    {/* 状态指示器装饰线 */}
                    <div className={cn(
                      'absolute top-0 left-0 w-1 h-full transition-colors',
                      api.status === 'online' ? 'bg-green-500' :
                      api.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                    )} />
                    
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{api.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{api.provider}</p>
                      </div>
                      <span 
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold',
                          api.status === 'online' 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                            : api.status === 'degraded'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            : 'bg-red-500/10 text-red-500 border border-red-500/30'
                        )}
                      >
                        {api.status === 'online' ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{t('api.online')}</span>
                          </>
                        ) : api.status === 'degraded' ? (
                          <>
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>{t('api.degraded')}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            <span>{t('api.offline')}</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span className="font-medium">{t('api.latency')}</span>
                          <span className={cn(
                            'font-bold text-sm',
                            api.latency >= LATENCY_THRESHOLD && api.status !== 'offline' ? 'text-amber-500' : 'text-foreground'
                          )}>
                            {api.status === 'offline' ? t('api.timeout') : `${api.latency}ms`}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              'h-full rounded-full transition-all duration-700 ease-out',
                              getProgressBarColor(api.latency, api.status)
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
                            <div className="bg-muted/30 rounded-lg p-2.5">
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
                                <span className="uppercase tracking-wide">{t('api.errorRate')}</span>
                                <span className="font-semibold text-foreground">{api.errorRate}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-amber-500 rounded-full"
                                  style={{ width: `${Math.min(api.errorRate, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {api.availability !== undefined && (
                            <div className="bg-muted/30 rounded-lg p-2.5">
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
                                <span className="uppercase tracking-wide">{t('api.availability')}</span>
                                <span className="font-semibold text-foreground">{api.availability}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${api.availability}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/15 pt-3.5 mt-5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>{t('api.lastChecked')}: {new Date(api.lastChecked).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      {api.retries && api.retries > 0 && (
                        <div className={cn(
                          'flex items-center gap-1.5 px-2 py-0.5 rounded-full',
                          api.status === 'offline' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                        )}>
                          <AlertTriangle className="h-3 w-3" />
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
        <div className="w-full border border-dashed border-border/30 p-8 md:p-16 text-center rounded-xl bg-card/30">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <BarChart3 className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-6 text-xl font-semibold text-foreground">{t('api.noApiConfigured')}</h3>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            {t('api.addApiHint')}
          </p>
        </div>
      )}
    </div>
  );
}