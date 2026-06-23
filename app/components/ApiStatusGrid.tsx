'use client';

import React, { useMemo } from 'react';
import { Activity, Server } from 'lucide-react';
import { cn, getStatusPulseColor, getLatencyColor, getProgressBarVariant } from '@/lib/utils';
import { LATENCY_THRESHOLD } from '@/constants';
import type { ApiStatus } from '@/types';
import { useI18n } from '@/hooks/useI18n';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function StatusDot({ status }: { status: ApiStatus['status'] }) {
  const pulseColor = getStatusPulseColor(status);

  return (
    <span
      className={cn(
        'relative flex size-2.5 rounded-full',
        status === 'online' && 'bg-emerald-500',
        status === 'degraded' && 'bg-amber-500',
        status === 'offline' && 'bg-destructive',
        pulseColor,
        status !== 'online' && 'animate-pulse'
      )}
    />
  );
}

function ProgressBar({ value, variant, showLabel = false }: { value: number; variant: 'success' | 'warning' | 'danger'; showLabel?: boolean }) {
  const clamped = Math.max(0, Math.min(100, value));
  
  const gradientClass = variant === 'success'
    ? 'from-emerald-500 to-emerald-400'
    : variant === 'warning'
      ? 'from-amber-500 to-amber-400'
      : 'from-red-500 to-red-400';

  return (
    <div className="flex flex-col gap-1.5">
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          {Math.round(clamped)}%
        </span>
      )}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-1000 ease-out',
            gradientClass
          )}
          style={{ width: `${clamped}%` }}
        />
        <div 
          className="absolute inset-y-0 left-0 rounded-full opacity-30"
          style={{ 
            width: `${clamped}%`,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shimmer 2s infinite'
          }}
        />
      </div>
    </div>
  );
}

export default function ApiStatusGrid({ statuses }: { statuses: ApiStatus[] }) {
  const { t } = useI18n();

  const providers = useMemo(() => {
    const grouped = statuses.reduce<Record<string, ApiStatus[]>>((acc, api) => {
      const key = api.provider || t('api.other');
      if (!acc[key]) acc[key] = [];
      acc[key].push(api);
      return acc;
    }, {});
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [statuses, t]);

  if (providers.length === 0) {
    return (
      <Card className="border-dashed border-border/50 bg-secondary/30">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="relative">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted animate-pulse">
              <Server className="size-8 text-muted-foreground" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/10 blur-xl" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{t('api.noApiConfigured')}</h3>
            <p className="mt-2 text-muted-foreground">{t('api.addApiHint')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {providers.map(([provider, apis]) => (
        <div key={provider} className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
                <Activity className="size-5 text-primary" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-primary/5 blur-xl" />
            </div>
            <h3 className="text-xl font-semibold">{provider}</h3>
            <Badge variant="secondary" className="px-3 py-1">
              <span className="flex items-center gap-1.5">
                <Activity className="size-3" />
                {apis.length} {t('api.apis')}
              </span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {apis.map((api, index) => {
              const isOffline = api.status === 'offline';
              const isDegraded = api.status === 'degraded';
              const latencyHigh = api.latency >= LATENCY_THRESHOLD && !isOffline;

              const latencyVariant = getProgressBarVariant(api.latency, LATENCY_THRESHOLD, isOffline);
              const latencyColorClass = getLatencyColor(api.latency, LATENCY_THRESHOLD, isOffline);

              const statusBadgeVariant = isOffline
                ? 'destructive'
                : isDegraded
                  ? 'secondary'
                  : 'default';

              return (
                <Card
                  key={api.id}
                  className={cn(
                    'group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-500',
                    'hover:border-primary/30',
                    'card-hover-lift',
                    isOffline && 'border-destructive/40 bg-destructive/5',
                    index % 2 === 0 ? 'animate-fade-in-up' : 'animate-slide-in-right'
                  )}
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {!isOffline && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}
                  
                  {isOffline && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-destructive via-destructive/70 to-transparent" />
                  )}

                  <CardHeader className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="truncate text-base group-hover:text-primary transition-colors">
                          {api.name}
                        </CardTitle>
                        <CardDescription className="mt-1">{provider}</CardDescription>
                      </div>
                      <Badge 
                        variant={statusBadgeVariant as 'default' | 'secondary' | 'destructive'}
                        className="relative z-10"
                      >
                        <span className="flex items-center gap-1.5">
                          <StatusDot status={api.status} />
                          {t(`api.${api.status}`)}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
                    <div className="relative">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm text-muted-foreground">{t('api.latency')}</span>
                          <span
                            className={cn(
                              'text-2xl font-bold tabular-nums transition-colors',
                              latencyColorClass
                            )}
                          >
                            {isOffline ? t('api.timeout') : `${api.latency}ms`}
                          </span>
                        </div>
                      <div className="mt-3">
                        <ProgressBar
                          value={isOffline ? 100 : (api.latency / LATENCY_THRESHOLD) * 100}
                          variant={latencyVariant}
                        />
                      </div>
                    </div>

                    {(api.errorRate !== undefined || api.availability !== undefined) && (
                      <div className="grid grid-cols-2 gap-3">
                        {api.errorRate !== undefined && (
                          <div className={cn(
                            'rounded-lg border p-3 transition-all',
                            api.errorRate > 1 ? 'border-amber-500/30 bg-amber-500/5' : 'border-border/50 bg-muted/30'
                          )}>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                              <span className="font-medium">{t('api.errorRate')}</span>
                              <span className={cn(
                                'font-bold',
                                api.errorRate > 1 ? 'text-amber-500' : 'text-foreground'
                              )}>
                                {api.errorRate}%
                              </span>
                            </div>
                            <ProgressBar
                              value={api.errorRate}
                              variant={api.errorRate > 1 ? 'warning' : 'success'}
                            />
                          </div>
                        )}
                        {api.availability !== undefined && (
                          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                              <span className="font-medium">{t('api.availability')}</span>
                              <span className="font-bold text-emerald-400">{api.availability}%</span>
                            </div>
                            <ProgressBar
                              value={api.availability}
                              variant="success"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {isOffline && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">
                              {t('api.retries')}
                            </p>
                            <p className="mt-1 text-2xl font-bold text-destructive">
                              {api.retries ?? 2}x
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-muted-foreground">{t('api.timeout')}</span>
                            <span className="text-[10px] text-destructive/70">
                              {new Date(api.lastChecked).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="relative flex items-center justify-between text-xs text-muted-foreground border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <span>{t('api.lastChecked')}: {new Date(api.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {api.retries && api.retries > 0 && !isOffline && (
                      <Badge variant="secondary" className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border-amber-500/20">
                        <span className="flex items-center gap-1">
                          <Activity className="size-3" />
                          {api.retries} {t('api.retries')}
                        </span>
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
