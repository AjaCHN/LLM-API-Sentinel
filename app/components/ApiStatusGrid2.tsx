// app/components/ApiStatusGrid2.tsx v2.5.0
'use client';

import React from 'react';

export default function ApiStatusGrid2({ statuses }: { statuses: any[] }) {
  return (
    <div>
      <h2>API Status Grid</h2>
      {statuses.map(api => (
        <div key={api.id}>
          <h3>{api.name}</h3>
          <p>{api.status}</p>
        </div>
      ))}
    </div>
  );
}