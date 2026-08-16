// app/components/ApiStatusGrid.tsx v2.10.5
'use client';

import React from 'react';
import type { ApiStatus } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import ApiStatusCard from './ApiStatusCard';

export default function ApiStatusGrid({ statuses }: { statuses: ApiStatus[] }) {
  const { t } = useI18n();

  if (statuses.length === 0) return null;

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
