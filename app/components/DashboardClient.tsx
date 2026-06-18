'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { AlertTriangle, Settings, RefreshCw, Zap, Database, Globe } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardHeader from '@/components/DashboardHeader';
import GeoOptInDialog from '@/components/GeoOptInDialog';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

  const chartData = useMemo(() => {
    return history.reduce<ChartDataPoint[]>((acc, curr) => {
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
  }, [history]);

  // 性能优化: 使用 useMemo 缓存统计计算结果
  const stats = useMemo(() => {
    const online = statuses.filter(s => s.status === 'online').length;
    const degraded = statuses.filter(s => s.status === 'degraded').length;
    const offline = statuses.filter(s => s.status === 'offline').length;
    const avgLatency = statuses.length > 0
      ? Math.round(statuses.reduce((sum, s) => sum + s.latency, 0) / statuses.length)
      : 0;
    return { online, degraded, offline, avgLatency };
  }, [statuses]);

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

      <GeoOptInDialog />

      <AlertsDropdown
        alerts={alerts}
        show={showAlerts}
        onClose={() => setShowAlerts(false)}
        resolveAlert={resolveAlert}
      />

      <main className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center">
            <Badge 
              variant="secondary" 
              className="mb-6 px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/20"
            >
              <Globe className="mr-2 size-4" />
              {t('dashboard.globalAIApiMonitoring')}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {t('dashboard.title')}
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-12">
              {t('dashboard.description')}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="group relative rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Zap className="size-4 text-emerald-400" />
                  </div>
                  <span className="text-xs text-muted-foreground">{t('api.online')}</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400 group-hover:scale-110 transition-transform">
                  {stats.online}
                </p>
              </div>

              <div className="group relative rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 p-4 transition-all duration-300 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle className="size-4 text-amber-400" />
                  </div>
                  <span className="text-xs text-muted-foreground">{t('api.degraded')}</span>
                </div>
                <p className="text-2xl font-bold text-amber-400 group-hover:scale-110 transition-transform">
                  {stats.degraded}
                </p>
              </div>

              <div className="group relative rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 p-4 transition-all duration-300 hover:border-destructive/30 hover:shadow-lg hover:shadow-destructive/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Database className="size-4 text-destructive" />
                  </div>
                  <span className="text-xs text-muted-foreground">{t('api.offline')}</span>
                </div>
                <p className="text-2xl font-bold text-destructive group-hover:scale-110 transition-transform">
                  {stats.offline}
                </p>
              </div>

              <div className="group relative rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="size-4 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">{t('api.averageLatency')}</span>
                </div>
                <p className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">
                  {stats.avgLatency}ms
                </p>
              </div>
            </div>
          </div>
        </section>

        {alerts.length > 0 && (
          <section className="-mt-4 mb-8">
            <Alert className="border-destructive/30 bg-destructive/5 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
                  <AlertTriangle className="size-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <AlertTitle className="text-base font-semibold">
                    {t('alerts.alertsLabel')}: {alerts.length} {alerts.length > 1 ? t('alerts.activeIssuesPlural') : t('alerts.activeIssues')} {t('alerts.detected')}
                  </AlertTitle>
                  <AlertDescription className="mt-1 text-sm">
                    {stats.offline} {t('alerts.offline')} · {stats.degraded} {t('alerts.highLatency')}
                  </AlertDescription>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowAlerts(true)}
                  className="whitespace-nowrap shadow-lg shadow-destructive/20"
                >
                  {t('alerts.viewDetails')}
                </Button>
              </div>
            </Alert>
          </section>
        )}

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
                    <RefreshCw className="mr-2 size-3" />
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
                      'transition-all duration-300',
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
