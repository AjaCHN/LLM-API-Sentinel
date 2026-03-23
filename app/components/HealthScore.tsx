// app/components/HealthScore.tsx v3.5.1
'use client';

import { calculateHealthScore } from '../lib/scoring';

export default function HealthScore({ availability, avgLatency, errorRate }: { availability: number, avgLatency: number, errorRate: number }) {
  const score = calculateHealthScore(availability, avgLatency, errorRate);
  
  let color = 'text-green-500';
  if (score < 70) color = 'text-yellow-500';
  if (score < 40) color = 'text-red-500';

  return (
    <div className="flex items-center gap-2">
      <span className={`text-2xl font-bold ${color}`}>{score}</span>
      <span className="text-sm text-muted-foreground">/ 100</span>
    </div>
  );
}
