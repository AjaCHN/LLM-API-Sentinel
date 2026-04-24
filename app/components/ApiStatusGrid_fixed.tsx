// app/components/ApiStatusGrid.tsx v2.5.0
'use client';

import React from 'react';

export default function ApiStatusGrid({ statuses }: { statuses: any[] }) {
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