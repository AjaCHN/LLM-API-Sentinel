'use client';

import { memo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import type { ApiStatus, ChartDataPoint } from '@/types';
import { CHART_DATA_LIMIT } from '@/constants';

import { Card, CardContent } from '@/components/ui/card';

interface LatencyHistoryChartProps {
  chartData: ChartDataPoint[];
  statuses: ApiStatus[];
  getApiColor: (id: string) => string;
}

function LatencyHistoryChart({
  chartData,
  statuses,
  getApiColor,
}: LatencyHistoryChartProps) {
  const optimizedChartData = chartData.slice(-CHART_DATA_LIMIT);

  return (
    <Card>
      <CardContent className="h-[320px] p-4 md:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={optimizedChartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              {statuses.map((s) => (
                <linearGradient
                  key={`grad-${s.id}`}
                  id={`color-${s.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={getApiColor(s.id)} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={getApiColor(s.id)} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="6 6" stroke="currentColor" opacity={0.06} vertical={false} />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.4 }}
              interval={optimizedChartData.length > 20 ? 'preserveStartEnd' : 0}
              dy={12}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.4 }}
              label={{
                value: 'ms',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: '11px', opacity: 0.4 },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontSize: '12px',
                color: 'var(--foreground)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(99,102,241,0.1)',
                padding: '12px 16px',
              }}
              itemStyle={{ padding: '4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}
              labelStyle={{ marginBottom: '10px', fontWeight: 600, fontSize: '11px', opacity: 0.7 }}
              filterNull={true}
              formatter={(value) => value !== undefined ? [`${value}ms`, ''] : ['', '']}
            />
            {statuses.map((s) => (
              <Area
                key={s.id}
                type="monotone"
                dataKey={s.id}
                stroke={getApiColor(s.id)}
                fillOpacity={1}
                fill={`url(#color-${s.id})`}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                animationDuration={1200}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default memo(LatencyHistoryChart, (prevProps, nextProps) => {
  return (
    JSON.stringify(prevProps.chartData) === JSON.stringify(nextProps.chartData) &&
    JSON.stringify(prevProps.statuses) === JSON.stringify(nextProps.statuses)
  );
});
