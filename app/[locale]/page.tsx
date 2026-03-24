// app/[locale]/page.tsx v4.0.2
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useDashboardData } from '../hooks/useDashboardData';
import DashboardHeader from '../components/DashboardHeader';
import ApiStatusGrid from '../components/ApiStatusGrid';
import TaskList from '../components/TaskList';
import DashboardFooter from '../components/DashboardFooter';
import ErrorBoundary from '../components/ErrorBoundary';
import ApiConfigModal from '../components/ApiConfigModal';
import AlertBanner from '../components/AlertBanner';
import ControlBar from '../components/ControlBar';
import ChartSection from '../components/ChartSection';
import { getApiColor } from '../lib/utils';
import { REGIONS, ApiConfig } from '../lib/monitor';
import { saveApiConfig } from '../lib/config';

export default function Dashboard() {
  const { statuses, history, alerts, tasks, user, isChecking, lastUpdate, geo, runCheck, resolveAlert, addTask, updateTaskStatus, deleteTask, login, logout, baselines } = useDashboardData();
  const [showAlerts, setShowAlerts] = useState(false);
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
  const filteredHistory = history.filter(h => h.region === selectedRegion || !h.region);

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
          <AlertBanner alerts={alerts} onViewDetails={() => setShowAlerts(true)} />

          <ControlBar 
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            regions={REGIONS}
            lastUpdate={lastUpdate}
            runCheck={runCheck}
            isChecking={isChecking}
            user={user}
          />

          <section id="status-grid-section">
            <ApiStatusGrid statuses={filteredStatuses} baselines={baselines} onEditConfig={setEditingApi} />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <ChartSection 
              history={filteredHistory}
              statuses={filteredStatuses}
              baselines={baselines}
              getApiColor={getApiColor}
            />

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

