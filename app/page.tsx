'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { useDashboardData } from './hooks/useDashboardData';
import DashboardHeader from './components/DashboardHeader';
import ApiStatusGrid from './components/ApiStatusGrid';
import LatencyHistoryChart from './components/LatencyHistoryChart';
import DashboardFooter from './components/DashboardFooter';
import ApiConfig from './components/ApiConfig';
import { getApiColor, cn } from './lib/utils';
import { AlertTriangle, Settings } from 'lucide-react';
import { ChartDataPoint } from './types/index';
import { useI18n } from './hooks/useI18n';

export default function Dashboard() {
  const { statuses, history, alerts, user, isChecking, lastUpdate, geo, runCheck, resolveAlert, login, logout } = useDashboardData();
  const [showAlerts, setShowAlerts] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = history.reduce((acc: ChartDataPoint[], curr) => {
    const time = curr.time;
    if (!time) return acc;
    let existing = acc.find(a => a.time === time);
    if (!existing) {
      existing = { time };
      acc.push(existing);
    }
    existing[curr.apiId] = curr.latency;
    return acc;
  }, []);

  if (!mounted) return null;

  return (
    <div id="app-container" className="min-h-screen bg-background text-foreground transition-colors duration-500">
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

      <main id="main-content" className="px-6 md:px-10 lg:px-16">
        <section className="hero-gradient pt-16 md:pt-24 pb-12 md:pb-20">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <p className="mono-label text-primary">{t('dashboard.globalAIApiMonitoring')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
              {t('dashboard.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('dashboard.description')}
            </p>
          </div>
        </section>

        {alerts.length > 0 && (
          <section className="-mt-6">
            <div id="alerts-banner" className="bg-error/8 border border-error/20 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in-up">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-error/15 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-error" />
                </div>
                <div>
                  <p className="text-base md:text-lg font-semibold">
                    {t('alerts.alertsLabel')}: {alerts.length} {alerts.length > 1 ? t('alerts.activeIssuesPlural') : t('alerts.activeIssues')} {t('alerts.detected')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {alerts.filter(a => a.severity === 'critical').length} {t('alerts.offline')} · {alerts.filter(a => a.severity === 'high' || a.severity === 'medium').length} {t('alerts.highLatency')}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAlerts(true)} className="apple-button px-6 py-3 bg-error text-white rounded-2xl text-sm font-semibold hover:opacity-90 whitespace-nowrap">
                {t('alerts.viewDetails')}
              </button>
            </div>
          </section>
        )}

        <section id="status-grid-section" className="py-12 md:py-16 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold">{t('dashboard.status')}</h2>
              <p className="text-muted-foreground mt-2">{t('dashboard.realTimeMonitoring')}</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
              {lastUpdate && (
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-4 py-2 rounded-2xl">
                  {t('dashboard.lastSync')}: {format(lastUpdate, 'HH:mm:ss')}
                </span>
              )}
              <button 
                onClick={() => setShowConfig(!showConfig)}
                className="apple-button flex items-center gap-2 px-4 py-3 bg-secondary hover:bg-muted rounded-2xl text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                {t('dashboard.config')}
              </button>
              <button 
                onClick={runCheck}
                disabled={isChecking || !user}
                className={cn(
                  "apple-button px-5 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold",
                  (isChecking || !user) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isChecking ? t('dashboard.checking') : t('dashboard.checkNow')}
              </button>
            </div>
          </div>
          {showConfig && (
            <div className="animate-scale-in-gentle">
              <ApiConfig />
            </div>
          )}
          <ApiStatusGrid statuses={statuses} />
        </section>

        <section id="history-chart-section" className="py-12 md:py-16 bg-secondary/30">
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold">{t('dashboard.latencyHistory')}</h2>
                <p className="text-muted-foreground mt-2">{t('dashboard.performanceTrends')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 text-xs font-medium bg-card border border-border/20 rounded-xl hover:bg-secondary transition-colors">
                  {t('dashboard.lastHour')}
                </button>
                <button className="px-4 py-2 text-xs font-medium bg-secondary rounded-xl hover:bg-muted transition-colors">
                  {t('dashboard.last6Hours')}
                </button>
                <button className="px-4 py-2 text-xs font-medium bg-secondary rounded-xl hover:bg-muted transition-colors">
                  {t('dashboard.last24Hours')}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-border/10">
              {statuses.slice(0, 8).map(s => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getApiColor(s.id) }} />
                  <span className="text-xs font-medium text-muted-foreground">{s.name}</span>
                </div>
              ))}
              {statuses.length > 8 && <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-2xl">+{statuses.length - 8} {t('dashboard.more')}</span>}
            </div>
            <LatencyHistoryChart chartData={chartData} statuses={statuses} getApiColor={getApiColor} />
          </div>
        </section>

        <DashboardFooter />
      </main>
    </div>
  );
}