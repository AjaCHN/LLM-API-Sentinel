// app/components/StatusGrid.tsx v2.6.3
'use client';

import ApiStatusGrid from './ApiStatusGrid';
import type { ApiStatus } from '@/types';

export default function StatusGrid({ statuses }: { statuses: ApiStatus[] }) {
  return <ApiStatusGrid statuses={statuses} />;
}
