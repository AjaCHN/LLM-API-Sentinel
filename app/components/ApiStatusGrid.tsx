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

  let cardIndex = 0;

  return (
    <div id="api-cards-container" className="space-y-10">
      {providers.length > 0 ? (
        providers.map((provider) => (
          <div key={provider} className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center',
                  provider === 'United States' ? 'bg-blue-500/10' : 'bg-rose-500/10'
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={provider === 'United States' ? '#3b82f6' : '#f43f5e'} strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                </div>
                <h3 className="text-lg font-semibold">{provider}</h3>
              </div>
              <span className="text-xs font-mono opacity-40">
                {statusesByProvider[provider].length} APIs
              </span>
            </div>
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
            >
              {statusesByProvider[provider].map((api) => {
                const animationDelay = `${cardIndex * 0.05}s`;
                cardIndex++;
                return (
                  <div 
                    key={api.id} 
                    id={`api-card-${api.id}`} 
                    className="card-hover bg-card border border-border/60 rounded-3xl p-6 shadow-card relative overflow-hidden animate-fade-up"
                    style={{ animationDelay }}
                  >
                    {/* 状态指示器装饰线 */}
                    <div className={cn(
                      'absolute top-0 left-0 w-1 h-full transition-colors rounded-l-3xl',
                      api.status === 'online' ? 'bg-gradient-to-b from-green-400 to-green-600' :
                      api.status === 'degraded' ? 'bg-gradient-to-b from-amber-400 to-amber-600' : 
                      'bg-gradient-to-b from-rose-400 to-rose-600'
                    )} />
                    
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-muted/40 flex items-center justify-center">
                          <span className="text-sm font-bold opacity-70">{api.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{api.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{api.provider}</p>
                        </div>
                      </div>
                      <span 
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold',
                          api.status === 'online' 
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                            : api.status === 'degraded'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        )}
                      >
                        {api.status === 'online' ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            <span>{t('api.online')}</span>
                          </>
                        ) : api.status === 'degraded' ? (
                          <>
                            <AlertTriangle className="h-3 w-3" />
                            <span>{t('api.degraded')}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
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
                            api.status === 'offline' ? 'text-rose-600 dark:text-rose-400' :
                            api.latency >= LATENCY_THRESHOLD ? 'text-amber-600 dark:text-amber-400' : ''
                          )}>
                            {api.status === 'offline' ? t('api.timeout') : `${api.latency}ms`}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              'h-full rounded-full transition-all duration-800 ease-out progress-animate',
                              api.status === 'online' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                              api.status === 'degraded' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                              'bg-gradient-to-r from-rose-400 to-rose-500'
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
                              'rounded-2xl p-3',
                              api.errorRate > 1 ? 'bg-amber-500/10' : 'bg-muted/40'
                            )}>
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                                <span className="uppercase tracking-wide">{t('api.errorRate')}</span>
                                <span className="font-semibold">{api.errorRate}%</span>
                              </div>
                              <div className="h-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={cn('h-full rounded-full', api.errorRate > 1 ? 'bg-amber-500/60' : 'bg-primary/60')}
                                  style={{ width: `${Math.min(api.errorRate, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {api.availability !== undefined && (
                            <div className="bg-muted/40 rounded-2xl p-3">
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                                <span className="uppercase tracking-wide">{t('api.availability')}</span>
                                <span className="font-semibold">{api.availability}%</span>
                              </div>
                              <div className="h-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary/60 rounded-full"
                                  style={{ width: `${api.availability}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground/60 border-t border-border/50 pt-4 mt-5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(api.lastChecked).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      {api.retries && api.retries > 0 && (
                        <div className={cn(
                          'flex items-center gap-1 px-2 py-0.5 rounded-full',
                          api.status === 'offline' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 
                          'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        )}>
                          <AlertTriangle className="h-2.5 w-2.5" />
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