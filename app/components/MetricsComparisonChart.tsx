// app/components/MetricsComparisonChart.tsx v3.5.1
'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

export default function MetricsComparisonChart({ baselines, statuses }: { baselines: Record<string, any>, statuses: any[] }) {
  const data = statuses.map(api => {
    const baseline = baselines[api.id];
    return {
      name: api.name,
      id: api.id,
      originalId: api.originalId || api.id.split('-')[0],
      avgLatency: baseline && typeof baseline.avgLatency === 'number' ? Math.round(baseline.avgLatency) : 0,
      p95Latency: baseline && typeof baseline.p95Latency === 'number' ? Math.round(baseline.p95Latency) : 0,
      avgThroughput: baseline && typeof baseline.avgThroughput === 'number' && !isNaN(baseline.avgThroughput) ? Number(baseline.avgThroughput.toFixed(1)) : 0,
    };
  }).filter(d => d.avgLatency > 0);

  if (data.length === 0) {
    return (
      <div className="h-[250px] md:h-[350px] w-full flex items-center justify-center border border-dashed border-border/30 rounded-lg">
        <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">No baseline data available.</p>
      </div>
    );
  }

  return (
    <div className="h-[250px] md:h-[350px] w-full relative min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} aspect={undefined}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={{ stroke: 'currentColor', opacity: 0.1 }}
            tickLine={false}
            tick={{ fontSize: 9, fontFamily: 'monospace', fill: 'currentColor', opacity: 0.4 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            axisLine={{ stroke: 'currentColor', opacity: 0.1 }}
            tickLine={false}
            tick={{ fontSize: 9, fontFamily: 'monospace', fill: 'currentColor', opacity: 0.4 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--card)', 
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '9px',
              color: 'var(--foreground)'
            }}
            cursor={{ fill: 'currentColor', opacity: 0.05 }}
          />
          <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', opacity: 0.7 }} />
          <Bar dataKey="avgLatency" name="Avg Latency (ms)" fill="#10b981" radius={[2, 2, 0, 0]} />
          <Bar dataKey="p95Latency" name="Peak Latency (ms)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
