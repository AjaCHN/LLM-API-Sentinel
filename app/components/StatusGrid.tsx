// app/components/StatusGrid.tsx v2.6.2
'use client';

import ApiStatusGrid from './ApiStatusGrid';
import { ApiStatus } from '../types';

export default function StatusGrid({ statuses }: { statuses: ApiStatus[] }) {
  return <ApiStatusGrid statuses={statuses} />;
}
