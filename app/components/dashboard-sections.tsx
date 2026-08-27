// app/components/dashboard-sections.tsx v2.10.15
'use client';

import { format } from 'date-fns';
import { RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ApiStatusGrid from '@/components/ApiStatusGrid';
import LatencyHistoryChart from '@/components/LatencyHistoryChart';
import { cn, getApiColor } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18n';
import type { ApiStatus, ChartDataPoint } from '@/types';
import type { DashboardStats } from '@/hooks/useDashboardStats';

interface StatusMonitorSectionProps {
  statuses: ApiStatus[];
  stats: DashboardStats;
  lastUpdate: Date | null;
  isChecking: boolean;
  canRunCheck: boolean;
  showConfig: boolean;
  setShowConfig: (v: boolean) => void;
  runCheck: () => void;
  configSlot: React.ReactNode;
}

/** 状态监控区：API 实时状态卡片网格与手动检查入口 */
export function StatusMonitorSection({
  statuses,
  stats,
  lastUpdate,
  isChecking,
  canRunCheck,
  showConfig,
  setShowConfig,
  runCheck,
  configSlot,
}: StatusMonitorSectionProps) {
  const { t } = useI18n();

  return (
    <section className="py-8 md:py-12">
      <div className="mb-6 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold tracking-tight">
              {t('dashboard.status')}
            </h2>
            <Badge variant="secondary" className="px-3 py-1">
              {statuses.length} APIs
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('dashboard.realTimeMonitoring')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {lastUpdate && (
            <Badge variant="outline" className="px-3 py-1">
              <RefreshCw className="mr-2 size-3" aria-hidden="true" />
              {t('dashboard.lastSync')}: {format(lastUpdate, 'HH:mm:ss')}
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={() => setShowConfig(!showConfig)}
            className="gap-1.5"
          >
            <Settings className="size-4" />
            {t('dashboard.config')}
          </Button>
          <Button
            onClick={runCheck}
            disabled={isChecking || !canRunCheck}
            className="gap-1.5"
          >
            {isChecking ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                {t('dashboard.checking')}
              </>
            ) : (
              <>
                <RefreshCw className="size-4" />
                {t('dashboard.checkNow')}
              </>
            )}
          </Button>
        </div>
      </div>

      {showConfig && (
        <div className="mt-4 animate-in fade-in-0 zoom-in-95">
          {configSlot}
        </div>
      )}

      <div className="mt-6">
        <ApiStatusGrid statuses={statuses} isChecking={isChecking} />
      </div>
    </section>
  );
}

interface LatencyHistorySectionProps {
  statuses: ApiStatus[];
  chartData: ChartDataPoint[];
  timeRanges: readonly string[];
  activeRange: number;
  setActiveRange: (i: number) => void;
}

/** 延迟历史区：时间范围切换 + 图例 + 延迟趋势图 */
export function LatencyHistorySection({
  statuses,
  chartData,
  timeRanges,
  activeRange,
  setActiveRange,
}: LatencyHistorySectionProps) {
  const { t } = useI18n();

  return (
    <section className="py-8 md:py-12">
      <div className="mb-6 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {t('dashboard.latencyHistory')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('dashboard.performanceTrends')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {timeRanges.map((key, i) => (
            <Button
              key={key}
              variant={activeRange === i ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveRange(i)}
              className={cn(
                'transition-colors duration-300',
                activeRange === i && 'shadow-lg shadow-primary/20'
              )}
            >
              {t(key)}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="mb-6 flex flex-wrap gap-2 pb-6 border-b border-border/20">
            {statuses.slice(0, 8).map((s) => (
              <Badge key={s.id} variant="secondary" className="gap-1.5">
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ backgroundColor: getApiColor(s.id) }}
                />
                <span className="font-normal">{s.name}</span>
              </Badge>
            ))}
            {statuses.length > 8 && (
              <Badge variant="secondary">
                +{statuses.length - 8} {t('dashboard.more')}
              </Badge>
            )}
          </div>
          <LatencyHistoryChart
            chartData={chartData}
            statuses={statuses}
            getApiColor={getApiColor}
          />
        </CardContent>
      </Card>
    </section>
  );
}
