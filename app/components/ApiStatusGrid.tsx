// app/components/ApiStatusGrid.tsx v2.8.2
'use client';

import React, { useMemo } from 'react';
import { Activity, Server } from 'lucide-react';
import type { ApiStatus } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import ApiStatusCard from './ApiStatusCard';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
              <Server className="size-8 text-muted-foreground" aria-hidden="true" />
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
    <div id="status-section" className="flex flex-col gap-12">
      {providers.map(([provider, apis]) => (
        <div key={provider} id={`provider-group-${provider}`} className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
                <Activity className="size-5 text-primary" aria-hidden="true" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-primary/5 blur-xl" />
            </div>
            <h3 className="text-xl font-semibold">{provider}</h3>
            <Badge variant="secondary" className="px-3 py-1">
              <span className="flex items-center gap-1.5">
                <Activity className="size-3" aria-hidden="true" />
                {apis.length} {t('api.apis')}
              </span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {apis.map((api, index) => (
              <ApiStatusCard
                key={api.id}
                api={api}
                provider={provider}
                index={index}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
