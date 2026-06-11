'use client';

import React, { useMemo } from 'react';
import { Activity, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LATENCY_THRESHOLD } from '@/constants';
import type { ApiStatus } from '@/types';
import { useI18n } from '@/hooks/useI18n';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function StatusDot({ status }: { status: ApiStatus['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex size-2.5 rounded-full',
        status === 'online' && 'bg-emerald-500',
        status === 'degraded' && 'bg-amber-500',
        status === 'offline' && 'bg-destructive animate-pulse'
      )}
    />
  );
}

function ProgressBar({ value, variant }: { value: number; variant: 'success' | 'warning' | 'danger' }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-700 ease-out',
          variant === 'success' && 'bg-emerald-500',
          variant === 'warning' && 'bg-amber-500',
          variant === 'danger' && 'bg-destructive'
        )}
        style={{ width: `${clamped}%` }}
      />
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
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Server className="size-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t('api.noApiConfigured')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('api.addApiHint')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {providers.map(([provider, apis]) => (
        <div key={provider} className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
              <Activity className="size-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{provider}</h3>
            <Badge variant="secondary">
              {apis.length} {t('api.apis')}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {apis.map((api) => {
              const isOffline = api.status === 'offline';
              const isDegraded = api.status === 'degraded';
              const latencyHigh = api.latency >= LATENCY_THRESHOLD && !isOffline;

              const latencyVariant: 'success' | 'warning' | 'danger' = isOffline
                ? 'danger'
                : isDegraded || latencyHigh
                  ? 'warning'
                  : 'success';

              const statusBadgeVariant = isOffline
                ? 'destructive'
                : isDegraded
                  ? 'secondary'
                  : 'default';

              return (
                <Card
                  key={api.id}
                  className={cn(
                    'flex flex-col transition-all',
                    isOffline && 'border-destructive/30'
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="truncate">{api.name}</CardTitle>
                        <CardDescription className="mt-1">{provider}</CardDescription>
                      </div>
                      <Badge variant={statusBadgeVariant as 'default' | 'secondary' | 'destructive'}>
                        <span className="flex items-center gap-1.5">
                          <StatusDot status={api.status} />
                          {t(`api.${api.status}`)}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm text-muted-foreground">{t('api.latency')}</span>
                        <span
                          className={cn(
                            'text-xl font-semibold tabular-nums',
                            latencyHigh && 'text-amber-600',
                            isOffline && 'text-destructive'
                          )}
                        >
                          {isOffline ? t('api.timeout') : `${api.latency}ms`}
                        </span>
                      </div>
                      <div className="mt-2">
                        <ProgressBar
                          value={isOffline ? 100 : (api.latency / LATENCY_THRESHOLD) * 100}
                          variant={latencyVariant}
                        />
                      </div>
                    </div>

                    {(api.errorRate !== undefined || api.availability !== undefined) && (
                      <div className="grid grid-cols-2 gap-3">
                        {api.errorRate !== undefined && (
                          <div className="rounded-lg border bg-muted/40 p-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{t('api.errorRate')}</span>
                              <span className="font-semibold text-foreground">{api.errorRate}%</span>
                            </div>
                            <div className="mt-2">
                              <ProgressBar
                                value={api.errorRate}
                                variant={api.errorRate > 1 ? 'warning' : 'success'}
                              />
                            </div>
                          </div>
                        )}
                        {api.availability !== undefined && (
                          <div className="rounded-lg border bg-muted/40 p-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{t('api.availability')}</span>
                              <span className="font-semibold text-foreground">{api.availability}%</span>
                            </div>
                            <div className="mt-2">
                              <ProgressBar value={api.availability} variant="success" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {isOffline && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                        <p className="text-xs text-muted-foreground">{t('api.retries')}</p>
                        <p className="text-lg font-semibold text-destructive">
                          {api.retries ?? 2} {t('api.times')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {t('api.lastChecked')}:{' '}
                      {new Date(api.lastChecked).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {api.retries && api.retries > 0 && !isOffline && (
                      <Badge variant="secondary">
                        {api.retries} {t('api.retries')}
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
