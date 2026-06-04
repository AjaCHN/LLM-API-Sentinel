// app/components/LatencyHistoryChart.tsx v2.6.1
'use client';

import React, { memo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ApiStatus, ChartDataPoint } from '../types';
import { CHART_DATA_LIMIT } from '../constants';

interface LatencyHistoryChartProps {
  chartData: ChartDataPoint[];
  statuses: ApiStatus[];
  getApiColor: (id: string) => string;
}

function LatencyHistoryChart({ chartData, statuses, getApiColor }: LatencyHistoryChartProps) {
  // 优化：限制显示的数据点数量，提高渲染性能
  const optimizedChartData = chartData.slice(-CHART_DATA_LIMIT); // 只显示最近50个数据点

  return (
    <div id="chart-container" className="h-[280px] md:h-[380px] w-full min-h-[200px] min-w-[300px] bg-card/30 rounded-xl p-4 border border-border/10">
      <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
        <AreaChart data={optimizedChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {statuses.map(s => (
              <linearGradient key={`grad-${s.id}`} id={`color-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getApiColor(s.id)} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={getApiColor(s.id)} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="currentColor" opacity={0.08} vertical={false} />
          <XAxis 
            dataKey="time" 
            axisLine={{ stroke: 'currentColor', opacity: 0.15 }}
            tickLine={false}
            tick={{ fontSize: 10, fontFamily: 'monospace', fill: 'currentColor', opacity: 0.5 }}
            interval={optimizedChartData.length > 20 ? 'preserveStartEnd' : 0}
            dy={10}
          />
          <YAxis 
            axisLine={{ stroke: 'currentColor', opacity: 0.15 }}
            tickLine={false}
            tick={{ fontSize: 10, fontFamily: 'monospace', fill: 'currentColor', opacity: 0.5 }}
            label={{ value: 'ms', angle: -90, position: 'insideLeft', style: { fontSize: '10px', fontFamily: 'monospace', opacity: 0.5 } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--card)', 
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: 'var(--foreground)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            itemStyle={{ padding: '4px 0' }}
            labelStyle={{ marginBottom: '6px', fontWeight: 'bold' }}
            filterNull={true}
          />
          {statuses.map(s => (
            <Area
              key={s.id}
              type="monotone"
              dataKey={s.id}
              stroke={getApiColor(s.id)}
              fillOpacity={1}
              fill={`url(#color-${s.id})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              animationDuration={1000}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 使用 React.memo 减少不必要的重渲染
export default memo(LatencyHistoryChart, (prevProps, nextProps) => {
  // 只有当数据或状态真正改变时才重渲染
  return (
    JSON.stringify(prevProps.chartData) === JSON.stringify(nextProps.chartData) &&
    JSON.stringify(prevProps.statuses) === JSON.stringify(nextProps.statuses)
  );
});
