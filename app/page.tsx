// app/page.tsx v3.0.0 - Apple Style
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

      <main id="main-content" className="px-6 md:px-10 py-10 max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('dashboard.globalAIApiMonitoring')} — Real-time health monitoring for all your AI services</p>
        </div>

        {/* Alerts Banner */}
        {alerts.length > 0 && (
          <div id="alerts-banner" className="bg-error/10 border border-error/20 p-6 rounded-3xl flex items-center justify-between animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-error/15 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-error" />
              </div>
              <div className="text-left">
                <p className="text-base font-semibold">
                  {t('alerts.alertsLabel')}: {alerts.length} {alerts.length > 1 ? t('alerts.activeIssuesPlural') : t('alerts.activeIssues')} {t('alerts.detected')}
                </p>
              </div>
            </div>
            <button onClick={() => setShowAlerts(true)} className="apple-button px-5 py-3 bg-error text-white rounded-2xl text-sm font-medium hover:opacity-90">
              {t('alerts.viewDetails')}
            </button>
          </div>
        )}

        {/* API Status Grid Section */}
        <section id="status-grid-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h2 className="text-2xl font-semibold">{t('dashboard.status')}</h2>
              <p className="text-sm text-muted-foreground mt-2">Real-time API health monitoring</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
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
                  "apple-button flex items-center gap-2.5 px-5 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-medium",
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

        {/* Latency History Chart Section */}
        <section id="history-chart-section" className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
            <div>
              <h2 className="text-2xl font-semibold">{t('dashboard.latencyHistory')}</h2>
              <p className="text-sm text-muted-foreground mt-2">Performance trends over time</p>
            </div>
            <div id="chart-legend" className="flex flex-wrap gap-x-3 gap-y-2 max-w-full scrollbar-hide">
              {statuses.slice(0, 8).map(s => (
                <div key={s.id} className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-2xl">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getApiColor(s.id) }} />
                  <span className="text-xs font-medium text-muted-foreground">{s.name}</span>
                </div>
              ))}
              {statuses.length > 8 && <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-2xl">+{statuses.length - 8} {t('dashboard.more')}</span>}
            </div>
          </div>
          <LatencyHistoryChart chartData={chartData} statuses={statuses} getApiColor={getApiColor} />
        </section>

        <DashboardFooter />
      </main>
    </div>
  );
}
