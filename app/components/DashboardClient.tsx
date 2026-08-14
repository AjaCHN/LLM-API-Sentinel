// app/components/DashboardClient.tsx v2.7.2
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { Settings, RefreshCw } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import DashboardHeader from '@/components/DashboardHeader';
import GeoOptInDialog from '@/components/GeoOptInDialog';
import ApiStatusGrid from '@/components/ApiStatusGrid';
import DashboardFooter from '@/components/DashboardFooter';
import { HeroSection } from '@/components/HeroSection';
import { AlertsBanner } from '@/components/AlertsBanner';
import { ChartSkeleton } from '@/components/ChartSkeleton';
import { getApiColor, cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18n';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// 性能优化: 使用 next/dynamic 延迟加载非关键组件，减少初始 bundle 大小
const LatencyHistoryChart = dynamic(
  () => import('@/components/LatencyHistoryChart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false // 图表不需要服务端渲染
  }
);

const ApiConfig = dynamic(
  () => import('@/components/ApiConfig'),
  { ssr: false }
);

const AlertsDropdown = dynamic(
  () => import('@/components/AlertsDropdown'),
  { ssr: false }
);

const TIME_RANGES = ['dashboard.lastHour', 'dashboard.last6Hours', 'dashboard.last24Hours'] as const;

export default function DashboardClient() {
  const {
    statuses,
    history,
    alerts,
    user,
    isChecking,
    lastUpdate,
    geo,
    isGeoLoading,
    refreshGeo,
    runCheck,
    resolveAlert,
    login,
    logout,
  } = useDashboardData();

  const { stats, chartData } = useDashboardStats(statuses, history);

  const [showAlerts, setShowAlerts] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeRange, setActiveRange] = useState<number>(0);
  const { t } = useI18n();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div id="dashboard" className="min-h-screen bg-background text-foreground">
      <DashboardHeader
        user={user}
        alerts={alerts}
        showAlerts={showAlerts}
        setShowAlerts={setShowAlerts}
        theme={theme}
        setTheme={setTheme}
        geo={geo}
        isGeoLoading={isGeoLoading}
        refreshGeo={refreshGeo}
        login={login}
        logout={logout}
        resolveAlert={resolveAlert}
      />

      <GeoOptInDialog />

      <AlertsDropdown
        alerts={alerts}
        show={showAlerts}
        onClose={() => setShowAlerts(false)}
        resolveAlert={resolveAlert}
      />

      <main className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        <HeroSection stats={stats} />

        <AlertsBanner
          alerts={alerts}
          stats={stats}
          onViewDetails={() => setShowAlerts(true)}
        />

        <section className="py-8 md:py-12">
          <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-col items-start gap-4 border-b border-border/30 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {t('dashboard.status')}
                  </h2>
                  <Badge variant="secondary" className="px-3 py-1">
                    {statuses.length} APIs
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
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
                  disabled={isChecking || !user}
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
            </CardHeader>
          </Card>

          {showConfig && (
            <div className="mt-4 animate-in fade-in-0 zoom-in-95">
              <ApiConfig />
            </div>
          )}

          <div className="mt-6">
            <ApiStatusGrid statuses={statuses} />
          </div>
        </section>

        <section className="py-8 md:py-12">
          <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-col items-start gap-4 border-b border-border/30 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {t('dashboard.latencyHistory')}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('dashboard.performanceTrends')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {TIME_RANGES.map((key, i) => (
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
            </CardHeader>
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

        <DashboardFooter />
      </main>
    </div>
  );
}
