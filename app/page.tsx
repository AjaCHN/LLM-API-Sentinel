// app/page.tsx v2.4.2
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { useDashboardData } from './hooks/useDashboardData';
import DashboardHeader from './components/DashboardHeader';
import ApiStatusGrid from './components/ApiStatusGrid';
import LatencyHistoryChart from './components/LatencyHistoryChart';
import DashboardFooter from './components/DashboardFooter';
import { getApiColor, cn } from './lib/utils';
import { AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { statuses, history, alerts, user, isChecking, lastUpdate, geo, runCheck, resolveAlert, login, logout } = useDashboardData();
  const [showAlerts, setShowAlerts] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = React.useMemo(() => {
    return history.reduce((acc: any[], curr) => {
      const time = curr.time;
      let existing = acc.find(a => a.time === time);
      if (!existing) {
        existing = { time };
        acc.push(existing);
      }
      existing[curr.apiId] = curr.latency;
      return acc;
    }, []);
  }, [history]);

  if (!mounted) return null;

  return (
    <div id="app-container" className="min-h-screen bg-background text-foreground transition-colors duration-300">
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

      <main id="main-content" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 md:space-y-8">
        {alerts.length > 0 && (
          <div id="alerts-banner" className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                System Alerts: {alerts.length} active issues
              </p>
            </div>
            <button onClick={() => setShowAlerts(true)} className="text-[10px] font-bold uppercase underline text-rose-500">View Details</button>
          </div>
        )}

        <section id="status-grid-section">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-2">
            <h2 className="text-xs font-mono uppercase opacity-50 tracking-widest italic font-serif">Current Status</h2>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              {lastUpdate && (
                <span className="text-[10px] font-mono opacity-50">
                  Last sync: {format(lastUpdate, 'HH:mm:ss')}
                </span>
              )}
              <button 
                onClick={runCheck}
                disabled={isChecking || !user}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 border border-border text-[10px] font-bold uppercase tracking-widest transition-all rounded-md",
                  isChecking ? "opacity-50 cursor-not-allowed" : "hover:bg-foreground hover:text-background",
                  !user && "opacity-30 cursor-not-allowed"
                )}
              >
                {isChecking ? "Checking..." : "Run Check"}
              </button>
            </div>
          </div>
          <ApiStatusGrid statuses={statuses} />
        </section>

        <section id="history-chart-section" className="border border-border bg-card/50 p-4 md:p-6 rounded-lg">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
            <h2 className="text-xs font-mono uppercase opacity-50 tracking-widest italic font-serif">Latency History (ms)</h2>
            <div id="chart-legend" className="flex flex-wrap gap-x-4 gap-y-2 max-w-full">
              {statuses.slice(0, 8).map(s => (
                <div key={s.id} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getApiColor(s.id) }} />
                  <span className="text-[9px] font-mono opacity-50 uppercase whitespace-nowrap">{s.name}</span>
                </div>
              ))}
              {statuses.length > 8 && <span className="text-[9px] font-mono opacity-30 uppercase">+{statuses.length - 8} more</span>}
            </div>
          </div>
          <LatencyHistoryChart chartData={chartData} statuses={statuses} getApiColor={getApiColor} />
        </section>

        <DashboardFooter />
      </main>
    </div>
  );
}
