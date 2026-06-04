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

      <main id="main-content" className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {alerts.length > 0 && (
          <div id="alerts-banner" className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-xl flex items-center justify-between animate-slide-in-from-top shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-500 uppercase tracking-wider">
                  {t('alerts.alertsLabel')}: {alerts.length} {alerts.length > 1 ? t('alerts.activeIssuesPlural') : t('alerts.activeIssues')} {t('alerts.detected')}
                </p>
              </div>
            </div>
            <button onClick={() => setShowAlerts(true)} className="text-xs font-bold uppercase underline text-rose-500 hover:no-underline transition-colors">
              {t('alerts.viewDetails')} →
            </button>
          </div>
        )}

        <section id="status-grid-section">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
            <div>
              <h2 className="text-xs font-mono uppercase opacity-50 tracking-widest italic">{t('dashboard.status')}</h2>
              <p className="text-sm text-muted-foreground mt-1">Real-time API health monitoring</p>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
              {lastUpdate && (
                <span className="text-[10px] font-mono opacity-50 bg-muted/30 px-2.5 py-1.5 rounded-lg">
                  {t('dashboard.lastSync')}: {format(lastUpdate, 'HH:mm:ss')}
                </span>
              )}
              <button 
                onClick={() => setShowConfig(!showConfig)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 border border-border/50 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl hover:bg-foreground hover:text-background"
                )}
              >
                <Settings className="w-3.5 h-3.5" />
                {t('dashboard.config')}
              </button>
              <button 
                onClick={runCheck}
                disabled={isChecking || !user}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 border border-border text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl",
                  isChecking ? "opacity-50 cursor-not-allowed" : "hover:bg-foreground hover:text-background",
                  !user && "opacity-30 cursor-not-allowed"
                )}
              >
                {isChecking ? t('dashboard.checking') : t('dashboard.checkNow')}
              </button>
            </div>
          </div>
          {showConfig && (
            <div className="mb-6 animate-scale-in">
              <ApiConfig />
            </div>
          )}
          <ApiStatusGrid statuses={statuses} />
        </section>

        <section id="history-chart-section">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 gap-4">
            <div>
              <h2 className="text-xs font-mono uppercase opacity-50 tracking-widest italic">{t('dashboard.latencyHistory')}</h2>
              <p className="text-sm text-muted-foreground mt-1">Performance trends over time</p>
            </div>
            <div id="chart-legend" className="flex flex-wrap gap-x-3 gap-y-2 max-w-full scrollbar-hide">
              {statuses.slice(0, 8).map(s => (
                <div key={s.id} className="flex items-center gap-1.5 bg-muted/30 px-2.5 py-1.5 rounded-lg">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getApiColor(s.id) }} />
                  <span className="text-[9px] font-mono opacity-70 uppercase whitespace-nowrap font-medium">{s.name}</span>
                </div>
              ))}
              {statuses.length > 8 && <span className="text-[9px] font-mono opacity-50 uppercase bg-muted/20 px-2 py-1 rounded-lg">+{statuses.length - 8} {t('dashboard.more')}</span>}
            </div>
          </div>
          <LatencyHistoryChart chartData={chartData} statuses={statuses} getApiColor={getApiColor} />
        </section>

        <DashboardFooter />
      </main>
    </div>
  );
}
