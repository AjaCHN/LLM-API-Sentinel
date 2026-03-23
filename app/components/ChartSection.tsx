// app/components/ChartSection.tsx v4.0.1
'use client';

import { useState } from 'react';
import { Activity, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '../lib/utils';
import LatencyHistoryChart from './LatencyHistoryChart';
import MetricsComparisonChart from './MetricsComparisonChart';

interface ChartSectionProps {
  history: any[];
  statuses: any[];
  baselines: Record<string, any>;
  getApiColor: (id: string) => string;
}

export default function ChartSection({
  history,
  statuses,
  baselines,
  getApiColor
}: ChartSectionProps) {
  const t = useTranslations();
  const [chartType, setChartType] = useState<'latency' | 'throughput' | 'baseline'>('latency');

  const chartData = history.reduce((acc: any[], curr) => {
    const time = curr.time;
    let existing = acc.find(a => a.time === time);
    if (!existing) {
      existing = { time };
      acc.push(existing);
    }
    existing[curr.apiId] = chartType === 'latency' ? curr.latency : (curr.throughput || 0);
    return acc;
  }, []);

  return (
    <section id="history-chart-section" className="lg:col-span-2 border border-border bg-card/50 p-4 md:p-6 rounded-lg">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xs font-mono uppercase opacity-50 tracking-widest italic font-serif">
            {chartType === 'latency' ? t('latency.title') : chartType === 'throughput' ? 'Throughput (req/s)' : 'Performance Baseline'}
          </h2>
          <div className="flex bg-background border border-border rounded-md p-0.5">
            <button
              onClick={() => setChartType('latency')}
              className={cn(
                "px-2 py-1 text-[10px] uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1",
                chartType === 'latency' ? "bg-foreground text-background font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Activity className="w-3 h-3" /> Latency
            </button>
            <button
              onClick={() => setChartType('throughput')}
              className={cn(
                "px-2 py-1 text-[10px] uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1",
                chartType === 'throughput' ? "bg-foreground text-background font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap className="w-3 h-3" /> Throughput
            </button>
            <button
              onClick={() => setChartType('baseline')}
              className={cn(
                "px-2 py-1 text-[10px] uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1",
                chartType === 'baseline' ? "bg-foreground text-background font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Activity className="w-3 h-3" /> Baseline
            </button>
          </div>
        </div>
        <div id="chart-legend" className={cn("flex flex-wrap gap-x-4 gap-y-2 max-w-full", chartType === 'baseline' && "hidden")}>
          {statuses.slice(0, 8).map(s => (
            <div key={s.id} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getApiColor(s.originalId || s.id) }} />
              <span className="text-[9px] font-mono opacity-50 uppercase whitespace-nowrap">{s.name}</span>
            </div>
          ))}
          {statuses.length > 8 && <span className="text-[9px] font-mono opacity-30 uppercase">+{statuses.length - 8} more</span>}
        </div>
      </div>
      
      {chartType === 'baseline' ? (
        <MetricsComparisonChart baselines={baselines} statuses={statuses} />
      ) : (
        <LatencyHistoryChart 
          chartData={chartData} 
          statuses={statuses} 
          getApiColor={(id) => getApiColor(id.split('-')[0])} 
        />
      )}
    </section>
  );
}
