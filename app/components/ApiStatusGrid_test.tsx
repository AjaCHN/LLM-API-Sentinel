// app/components/ApiStatusGrid_test.tsx v2.5.1
'use client';

import React from 'react';

export default function ApiStatusGridTest({ statuses }: { statuses: any[] }) {
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