'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { AlertTriangle, Settings } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardHeader from '@/components/DashboardHeader';
import ApiStatusGrid from '@/components/ApiStatusGrid';
import LatencyHistoryChart from '@/components/LatencyHistoryChart';
import DashboardFooter from '@/components/DashboardFooter';
import ApiConfig from '@/components/ApiConfig';
import AlertsDropdown from '@/components/AlertsDropdown';
import { getApiColor, cn } from '@/lib/utils';
import type { ChartDataPoint } from '@/types';
import { useI18n } from '@/hooks/useI18n';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const TIME_RANGES = ['dashboard.lastHour', 'dashboard.last6Hours', 'dashboard.last24Hours'] as const;

export default function Dashboard() {
  const {
    statuses,
    history,
    alerts,
    user,
    isChecking,
    lastUpdate,
    geo,
    runCheck,
    resolveAlert,
    login,
    logout,
  } = useDashboardData();

  const [showAlerts, setShowAlerts] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeRange, setActiveRange] = useState<number>(0);
  const { t } = useI18n();

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = history.reduce<ChartDataPoint[]>((acc, curr) => {
    const time = curr.time;
    if (!time) return acc;
    const existing = acc.find((a) => a.time === time);
    if (!existing) {
      acc.push({ time, [curr.apiId]: curr.latency });
    } else {
      existing[curr.apiId] = curr.latency;
    }
    return acc;
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader
        user={user}
        alerts={alerts}
        showAlerts={showAlerts}
        setShowAlerts={setShowAlerts}
        theme={theme}
        setTheme={setTheme}
        geo={geo}
        login={login}
        logout={logout}
        resolveAlert={resolveAlert}
      />

      <AlertsDropdown
        alerts={alerts}
        show={showAlerts}
        onClose={() => setShowAlerts(false)}
        resolveAlert={resolveAlert}
      />

      <main className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        <section className="py-16 md:py-20 text-center">
          <Badge variant="secondary" className="mx-auto">
            {t('dashboard.globalAIApiMonitoring')}
          </Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            {t('dashboard.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t('dashboard.description')}
          </p>
        </section>

        {alerts.length > 0 && (
          <section className="-mt-6">
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
                    <AlertTriangle className="size-6 text-destructive" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {t('alerts.alertsLabel')}: {alerts.length}{' '}
                      {alerts.length > 1 ? t('alerts.activeIssuesPlural') : t('alerts.activeIssues')}{' '}
                      {t('alerts.detected')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {alerts.filter((a) => a.severity === 'critical').length}{' '}
                      {t('alerts.offline')} ·{' '}
                      {alerts.filter((a) => a.severity === 'high' || a.severity === 'medium').length}{' '}
                      {t('alerts.highLatency')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowAlerts(true)}
                  className="whitespace-nowrap"
                >
                  {t('alerts.viewDetails')}
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        <section className="py-12 md:py-16">
          <Card>
            <CardHeader className="flex flex-col items-start gap-4 border-b md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t('dashboard.status')}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('dashboard.realTimeMonitoring')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {lastUpdate && (
                  <Badge variant="secondary">
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
                  {isChecking ? t('dashboard.checking') : t('dashboard.checkNow')}
                </Button>
              </div>
            </CardHeader>
          </Card>

          {showConfig && (
            <div className={cn('mt-4 animate-in fade-in-0 zoom-in-95')}>
              <ApiConfig />
            </div>
          )}

          <div className="mt-6">
            <ApiStatusGrid statuses={statuses} />
          </div>
        </section>

        <section className="py-12 md:py-16">
          <Card>
            <CardHeader className="flex flex-col items-start gap-4 border-b md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t('dashboard.latencyHistory')}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
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
                  >
                    {t(key)}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 flex flex-wrap gap-2 pb-6 border-b">
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
