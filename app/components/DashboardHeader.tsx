// app/components/DashboardHeader.tsx v2.6.0
'use client';

import React from 'react';
import { Activity, Bell, LogIn, LogOut, Sun, Moon, MapPin } from 'lucide-react';
import AlertsDropdown from './AlertsDropdown';
import { Alert } from '../types';
import { User } from 'firebase/auth';
import { useI18n } from '../hooks/useI18n';

interface DashboardHeaderProps {
  user: User | null;
  alerts: Alert[];
  showAlerts: boolean;
  setShowAlerts: (show: boolean) => void;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  geo: { city: string; country: string; ip?: string } | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
}

export default function DashboardHeader({ 
  user, 
  alerts, 
  showAlerts, 
  setShowAlerts, 
  theme, 
  setTheme, 
  geo, 
  login, 
  logout, 
  resolveAlert 
}: DashboardHeaderProps) {
  const { t } = useI18n();
  
  return (
    <header id="main-header" className="border-b border-border/20 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <div id="brand-section" className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center">
          <Activity className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight uppercase italic">{t('dashboard.title')}</h1>
          <p className="mono-label">{t('dashboard.globalAIApiMonitoring')}</p>
        </div>
      </div>
      
      <div id="controls-section" className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowAlerts(!showAlerts)}
            className="p-2 border border-border/50 hover:bg-foreground hover:text-background transition-colors rounded-md relative"
            title={t('alerts.alertsLabel')}
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full animate-pulse-slow">
                {alerts.length}
              </span>
            )}
          </button>
          
          {showAlerts && (
            <AlertsDropdown alerts={alerts} show={showAlerts} onClose={() => setShowAlerts(false)} resolveAlert={resolveAlert} />
          )}
        </div>

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 border border-border/50 hover:bg-foreground hover:text-background transition-colors rounded-md"
          title={t('dashboard.toggleTheme')}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {geo && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 border border-border/50 rounded-md bg-muted/30">
            <MapPin className="w-3 h-3 opacity-50" />
            <span className="text-[10px] font-mono uppercase tracking-tighter">{geo.city}, {geo.country}</span>
          </div>
        )}

        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold leading-none">{user.displayName}</p>
              <p className="text-[9px] opacity-50 font-mono leading-none">{user.email}</p>
            </div>
            <button 
              onClick={logout}
              className="p-2 border border-border/50 hover:bg-destructive hover:text-destructive-foreground transition-colors rounded-md"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={login}
            className="flex items-center gap-2 px-4 py-2 border border-border/50 hover:bg-foreground hover:text-background transition-colors uppercase text-[10px] font-bold tracking-widest rounded-md"
          >
            <LogIn className="w-4 h-4" />
            {t('dashboard.signIn')}
          </button>
        )}
      </div>
    </header>
  );
}
