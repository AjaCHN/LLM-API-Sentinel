// app/[locale]/page.tsx v3.7.0
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { useDashboardData } from '../hooks/useDashboardData';
import DashboardHeader from '../components/DashboardHeader';
import ApiStatusGrid from '../components/ApiStatusGrid';
import LatencyHistoryChart from '../components/LatencyHistoryChart';
import MetricsComparisonChart from '../components/MetricsComparisonChart';
import TaskList from '../components/TaskList';
import DashboardFooter from '../components/DashboardFooter';
import ErrorBoundary from '../components/ErrorBoundary';
import ApiConfigModal from '../components/ApiConfigModal';
import { getApiColor, cn } from '../lib/utils';
import { AlertTriangle, Activity, Zap, Globe } from 'lucide-react';
import { REGIONS, ApiConfig } from '../lib/monitor';
import { saveApiConfig } from '../lib/config';

export default function Dashboard() {
  const { statuses, history, alerts, tasks, user, isChecking, lastUpdate, geo, runCheck, resolveAlert, addTask, updateTaskStatus, deleteTask, login, logout, baselines } = useDashboardData();
  const [showAlerts, setShowAlerts] = useState(false);
  const [chartType, setChartType] = useState<'latency' | 'throughput' | 'baseline'>('latency');
  const [selectedRegion, setSelectedRegion] = useState<string>('na');
  const [editingApi, setEditingApi] = useState<any | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleSaveConfig = async (config: ApiConfig) => {
    await saveApiConfig(config);
    setEditingApi(null);
  };

  const filteredStatuses = statuses.filter(s => s.region === selectedRegion);
  const filteredHistory = history.filter(h => h.region === selectedRegion || !h.region); // Fallback for old data

  const chartData = filteredHistory.reduce((acc: any[], curr) => {
    const time = curr.time;
    let existing = acc.find(a => a.time === time);
    if (!existing) {
      existing = { time };
      acc.push(existing);
    }
    existing[curr.apiId] = chartType === 'latency' ? curr.latency : (curr.throughput || 0);
    return acc;
  }, []);

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
        <ErrorBoundary>
          {alerts.length > 0 && (
            <div id="alerts-banner" className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                  System Alert: {alerts.length} active issue{alerts.length > 1 ? 's' : ''} detected
                </p>
              </div>
              <button onClick={() => setShowAlerts(true)} className="text-[10px] font-bold uppercase underline text-rose-500">View Details</button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 opacity-50" />
              <span className="text-xs font-mono uppercase opacity-50 tracking-widest">Region:</span>
              <div className="flex bg-background border border-border rounded-md p-0.5 ml-2">
                {REGIONS.map(region => (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id)}
                    className={cn(
                      "px-3 py-1 text-[10px] uppercase tracking-wider rounded-sm transition-colors",
                      selectedRegion === region.id ? "bg-foreground text-background font-bold" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              {lastUpdate && (
                <span className="text-[10px] font-mono opacity-50">
                  SYNC: {format(lastUpdate, 'HH:mm:ss')}
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
                {isChecking ? 'Checking...' : 'Trigger'}
              </button>
            </div>
          </div>

          <section id="status-grid-section">
            <ApiStatusGrid statuses={filteredStatuses} baselines={baselines} onEditConfig={setEditingApi} />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <section id="history-chart-section" className="lg:col-span-2 border border-border bg-card/50 p-4 md:p-6 rounded-lg">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xs font-mono uppercase opacity-50 tracking-widest italic font-serif">
                    {chartType === 'latency' ? 'Latency History (ms)' : chartType === 'throughput' ? 'Throughput (req/s)' : 'Performance Baseline'}
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
                  {filteredStatuses.slice(0, 8).map(s => (
                    <div key={s.id} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getApiColor(s.originalId || s.id) }} />
                      <span className="text-[9px] font-mono opacity-50 uppercase whitespace-nowrap">{s.name}</span>
                    </div>
                  ))}
                  {filteredStatuses.length > 8 && <span className="text-[9px] font-mono opacity-30 uppercase">+{filteredStatuses.length - 8} more</span>}
                </div>
              </div>
              {chartType === 'baseline' ? (
                <MetricsComparisonChart baselines={baselines} statuses={filteredStatuses} />
              ) : (
                <LatencyHistoryChart chartData={chartData} statuses={filteredStatuses} getApiColor={(id) => getApiColor(id.split('-')[0])} />
              )}
            </section>

            <section id="tasks-section" className="lg:col-span-1">
              <TaskList 
                tasks={tasks} 
                addTask={addTask} 
                updateTaskStatus={updateTaskStatus} 
                deleteTask={deleteTask} 
              />
            </section>
          </div>
        </ErrorBoundary>

        <DashboardFooter />
      </main>
      
      {editingApi && (
        <ApiConfigModal 
          api={editingApi} 
          onClose={() => setEditingApi(null)} 
          onSave={handleSaveConfig} 
        />
      )}
    </div>
  );
}
