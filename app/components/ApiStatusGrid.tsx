// app/components/ApiStatusGrid.tsx v2.10.5
'use client';

import React from 'react';
import type { ApiStatus } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import ApiStatusCard from './ApiStatusCard';

export default function ApiStatusGrid({
  statuses,
  isChecking = false,
}: { statuses: ApiStatus[]; isChecking?: boolean }) {
  const { t } = useI18n();

  // 真实探测完成前展示占位骨架，避免空白或模拟数据闪现
  if (statuses.length === 0) {
    return (
      <section
        id="status-section"
        aria-busy={isChecking}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-xl border bg-card/50"
            aria-hidden="true"
          />
        ))}
        {!isChecking && (
          <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
            {t('dashboard.noData')}
          </p>
        )}
      </section>
    );
  }


  return (
    <section
      id="status-section"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {statuses.map((api, index) => (
        <ApiStatusCard
          key={api.id}
          api={api}
          provider={api.provider || t('api.other')}
          index={index}
        />
      ))}
    </section>
  );
}
