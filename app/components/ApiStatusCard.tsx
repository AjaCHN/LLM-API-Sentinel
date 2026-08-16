// app/components/ApiStatusCard.tsx v2.9.4
'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { cn, getLatencyColor, getProgressBarVariant } from '@/lib/utils';
import { LATENCY_THRESHOLD } from '@/constants';
import type { ApiStatus } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import { StatusDot } from './StatusDot';
import { ProgressBar } from './ProgressBar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ApiStatusCardProps {
  api: ApiStatus;
  provider: string;
  index: number;
}

export default function ApiStatusCard({ api, provider, index }: ApiStatusCardProps) {
  const { t } = useI18n();

  const isOffline = api.status === 'offline';
  const isDegraded = api.status === 'degraded';

  const latencyVariant = getProgressBarVariant(api.latency, LATENCY_THRESHOLD, isOffline);
  const latencyColorClass = getLatencyColor(api.latency, LATENCY_THRESHOLD, isOffline);

  const statusBadgeVariant = isOffline
    ? 'destructive'
    : isDegraded
      ? 'secondary'
      : 'default';

  return (
    <Card
      id={`api-status-${api.id}`}
      className={cn(
        'group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-shadow duration-500',
        'hover:border-primary/30',
        'card-hover-lift',
        isOffline && 'border-destructive/40 bg-destructive/5',
        index % 2 === 0 ? 'motion-safe:animate-fade-in-up' : 'motion-safe:animate-slide-in-right'
      )}
      style={{
        animationDelay: `${index * 0.08}s`,
        // 性能优化: content-visibility 优化离屏渲染
        contentVisibility: 'auto',
        containIntrinsicSize: '0 200px'
      }}
    >
      {!isOffline && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      {isOffline && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-destructive via-destructive/70 to-transparent" />
      )}

      <CardHeader className="relative p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate text-sm group-hover:text-primary transition-colors">
              {api.name}
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs">{provider}</CardDescription>
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

      <CardContent className="relative space-y-3 p-4 pt-2">
        <div className="relative">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-muted-foreground">{t('api.latency')}</span>
            <span
              className={cn(
                'text-xl font-bold tabular-nums transition-colors',
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
          <div className="grid grid-cols-2 gap-2">
            {api.errorRate !== undefined && (
              <div className={cn(
                'rounded-lg border p-2.5 transition-colors',
                api.errorRate > 1 ? 'border-amber-500/30 bg-amber-500/5' : 'border-border/50 bg-muted/30'
              )}>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
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
              <div className="rounded-lg border border-border/50 bg-muted/30 p-2.5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
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

      <CardFooter className="relative flex items-center justify-between gap-2 px-4 py-2.5 text-[11px] text-muted-foreground border-t border-border/30">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          <span>{t('api.lastChecked')}: {new Date(api.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {api.retries && api.retries > 0 && !isOffline && (
          <Badge variant="secondary" className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border-amber-500/20">
            <span className="flex items-center gap-1">
              <Activity className="size-3" aria-hidden="true" />
              {api.retries} {t('api.retries')}
            </span>
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
