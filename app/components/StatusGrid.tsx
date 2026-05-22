// app/components/StatusGrid.tsx v2.5.1
'use client';

import { ApiStatus } from '../types';

export default function StatusGrid({ statuses }: { statuses: ApiStatus[] }) {
  return (
    <div>
      {statuses.map(api => (
        <div key={api.id}>
          <h3>{api.name}</h3>
        </div>
      ))}
    </div>
  );
}