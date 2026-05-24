// app/components/StatusGrid.tsx v2.5.1
'use client';

import ApiStatusGrid from './ApiStatusGrid';
import { ApiStatus } from '../types';

export default function StatusGrid({ statuses }: { statuses: ApiStatus[] }) {
  return <ApiStatusGrid statuses={statuses} />;
}
