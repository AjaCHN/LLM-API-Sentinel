// app/page.tsx v2.6.1
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

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {alerts.length > 0 && (
          <div id="alerts-banner" className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500/15 via-rose-500/5 to-transparent border border-rose-500/20 p-6 animate-fade-up">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-float"></div>
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <p className="text-base font-bold text-rose-500">
                    {alerts.length} {alerts.length > 1 ? t('alerts.activeIssuesPlural') : t('alerts.activeIssues')} {t('alerts.detected')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {alerts.some(a => a.status === 'offline') ? '1 service offline' : ''} {alerts.some(a => a.status === 'degraded') ? '• 2 high latency alerts' : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAlerts(true)} className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-sm font-semibold transition-all border border-rose-500/30">
                {t('alerts.viewDetails')}
              </button>
            </div>
          </div>
        )}

        <section id="status-grid-section">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
            <div>
              <h2 className="mono-label mb-1.5">{t('dashboard.status')}</h2>
              <p className="text-2xl font-semibold tracking-tight">Real-time API Monitoring</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {lastUpdate && (
                <span className="text-[11px] font-mono opacity-40 hidden sm:block">
                  {t('dashboard.lastSync')}: {format(lastUpdate, 'HH:mm:ss')}
                </span>
              )}
              <button 
                onClick={() => setShowConfig(!showConfig)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-[11px] font-semibold btn-ghost flex-shrink-0"
              >
                <Settings className="w-3.5 h-3.5" />
                {t('dashboard.config')}
              </button>
              <button 
                onClick={runCheck}
                disabled={isChecking || !user}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-[11px] font-semibold transition-all flex-shrink-0",
                  !user || isChecking ? "opacity-30 cursor-not-allowed" : ""
                )}
              >
                {isChecking ? t('dashboard.checking') : t('dashboard.checkNow')}
              </button>
            </div>
          </div>
          {showConfig && (
            <div className="mb-6 animate-fade-up">
              <ApiConfig />
            </div>
          )}
          <ApiStatusGrid statuses={statuses} />
        </section>

        <section id="history-chart-section">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
            <div>
              <h2 className="mono-label mb-1.5">{t('dashboard.latencyHistory')}</h2>
              <p className="text-2xl font-semibold tracking-tight">Performance Trends</p>
            </div>
            <div id="chart-legend" className="flex flex-wrap gap-x-3 gap-y-2 justify-center">
              {statuses.slice(0, 8).map(s => (
                <div key={s.id} className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getApiColor(s.id) }} />
                  <span className="text-xs text-muted-foreground">{s.name}</span>
                </div>
              ))}
              {statuses.length > 8 && <span className="text-xs text-muted-foreground">+{statuses.length - 8} {t('dashboard.more')}</span>}
            </div>
          </div>
          <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6">
            <LatencyHistoryChart chartData={chartData} statuses={statuses} getApiColor={getApiColor} />
          </div>
        </section>

        <DashboardFooter />
      </main>
    </div>
  );
}
