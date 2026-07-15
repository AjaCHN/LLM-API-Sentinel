// app/components/StatusGrid.tsx v2.7.0
'use client';

import ApiStatusGrid from './ApiStatusGrid';
import type { ApiStatus } from '@/types';

export default function StatusGrid({ statuses }: { statuses: ApiStatus[] }) {
  return <ApiStatusGrid statuses={statuses} />;
}
