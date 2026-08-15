// app/components/DashboardClient.tsx v2.9.0
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import DashboardHeader from '@/components/DashboardHeader';
import GeoOptInDialog from '@/components/GeoOptInDialog';
import DashboardFooter from '@/components/DashboardFooter';
import { HeroSection } from '@/components/HeroSection';
import { AlertsBanner } from '@/components/AlertsBanner';
import { StatusMonitorSection, LatencyHistorySection } from '@/components/dashboard-sections';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const TIME_RANGES = ['dashboard.lastHour', 'dashboard.last6Hours', 'dashboard.last24Hours'] as const;

// 性能优化: 非关键组件延迟加载，减少初始 bundle
const ApiConfig = dynamic(() => import('@/components/ApiConfig'), { ssr: false });
const AlertsDropdown = dynamic(() => import('@/components/AlertsDropdown'), { ssr: false });

export default function DashboardClient() {
  const {
    statuses, history, alerts, user, isChecking, lastUpdate,
    geo, isGeoLoading, refreshGeo, runCheck, resolveAlert, login, logout,
  } = useDashboardData();

  const [showAlerts, setShowAlerts] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeRange, setActiveRange] = useState<number>(0);

  const { stats, chartData } = useDashboardStats(statuses, history, activeRange);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const canRunCheck = isChecking;

  return (
    <div id="dashboard" className="min-h-screen bg-background text-foreground">
      <DashboardHeader
        user={user} alerts={alerts} showAlerts={showAlerts} setShowAlerts={setShowAlerts}
        theme={theme} setTheme={setTheme} geo={geo} isGeoLoading={isGeoLoading}
        refreshGeo={refreshGeo} login={login} logout={logout} resolveAlert={resolveAlert}
      />

      <GeoOptInDialog />

      <AlertsDropdown
        alerts={alerts} show={showAlerts}
        onClose={() => setShowAlerts(false)} resolveAlert={resolveAlert}
      />

      <main className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        <HeroSection stats={stats} />

        <AlertsBanner alerts={alerts} stats={stats} onViewDetails={() => setShowAlerts(true)} />

        <StatusMonitorSection
          statuses={statuses}
          stats={stats}
          lastUpdate={lastUpdate}
          isChecking={isChecking}
          canRunCheck={canRunCheck}
          showConfig={showConfig}
          setShowConfig={setShowConfig}
          runCheck={runCheck}
          configSlot={<ApiConfig />}
        />

        <LatencyHistorySection
          statuses={statuses}
          chartData={chartData}
          timeRanges={TIME_RANGES}
          activeRange={activeRange}
          setActiveRange={setActiveRange}
        />

        <DashboardFooter />
      </main>
    </div>
  );
}
