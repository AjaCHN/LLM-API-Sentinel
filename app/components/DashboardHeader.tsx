// app/components/DashboardHeader.tsx v2.6.2
'use client';

import React from 'react';
import { Activity, Bell, LogIn, LogOut, Sun, Moon, MapPin } from 'lucide-react';
import AlertsDropdown from './AlertsDropdown';
import type { Alert, User } from '../types';
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
    <header id="main-header" className="border-b border-border/60 sticky top-0 z-50 bg-background/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div id="brand-section" className="flex items-center gap-4 flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold tracking-tight">{t('dashboard.title')}</h1>
              <p className="mono-label">{t('dashboard.globalAIApiMonitoring')}</p>
            </div>
          </div>
          
          <div id="controls-section" className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowAlerts(!showAlerts)}
                className="w-10 h-10 rounded-xl border border-border flex items-center justify-center btn-ghost relative"
                title={t('alerts.alertsLabel')}
              >
                <Bell className="w-[18px] h-[18px]" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse-slow">
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
              className="w-10 h-10 rounded-xl border border-border flex items-center justify-center btn-ghost"
              title={t('dashboard.toggleTheme')}
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            {geo && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/30">
                <MapPin className="w-3.5 h-3.5 opacity-40" />
                <span className="text-[11px] font-mono font-medium">{geo.city}, {geo.country}</span>
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-bold leading-none">{user.displayName}</p>
                  <p className="text-[10px] opacity-50 font-mono leading-none">{user.email}</p>
                </div>
                <button 
                  onClick={logout}
                  className="p-2.5 border border-border hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 rounded-xl"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all text-sm font-semibold shadow-md"
              >
                <LogIn className="w-4 h-4" />
                {t('dashboard.signIn')}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
