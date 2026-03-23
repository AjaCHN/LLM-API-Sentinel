// app/components/LatencyHistoryChart.tsx v3.5.1
'use client';

import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function LatencyHistoryChart({ chartData, statuses, getApiColor }: { chartData: any[], statuses: any[], getApiColor: (id: string) => string }) {
  console.log('LatencyHistoryChart rendering, data:', chartData);
  return (
    <div id="chart-container" className="h-[250px] md:h-[350px] w-full min-h-[250px] relative overflow-hidden">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50} aspect={undefined}>
        <AreaChart data={chartData}>
          <defs>
            {statuses.map(s => (
              <linearGradient key={`grad-${s.id}`} id={`color-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getApiColor(s.id)} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={getApiColor(s.id)} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
          <XAxis 
            dataKey="time" 
            axisLine={{ stroke: 'currentColor', opacity: 0.1 }}
            tickLine={false}
            tick={{ fontSize: 9, fontFamily: 'monospace', fill: 'currentColor', opacity: 0.4 }}
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
            itemStyle={{ padding: '0px' }}
          />
          {statuses.map(s => (
            <Area
              key={s.id}
              type="monotone"
              dataKey={s.id}
              stroke={getApiColor(s.id)}
              fillOpacity={1}
              fill={`url(#color-${s.id})`}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
