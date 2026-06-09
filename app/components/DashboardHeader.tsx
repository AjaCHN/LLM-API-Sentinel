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
    <header id="main-header" className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 h-16 md:h-18">
        <div className="flex items-center justify-between">
          <div id="brand-section" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Activity className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-semibold tracking-tight">{t('dashboard.title')}</h1>
              <p className="mono-label hidden md:block">{t('dashboard.globalAIApiMonitoring')}</p>
            </div>
          </div>
          
          <div id="controls-section" className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowAlerts(!showAlerts)}
                className="apple-button relative p-3 bg-secondary hover:bg-muted rounded-2xl"
                title={t('alerts.alertsLabel')}
              >
                <Bell className="w-5 h-5" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error text-white text-[10px] font-semibold flex items-center justify-center rounded-full">
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
              className="apple-button p-3 bg-secondary hover:bg-muted rounded-2xl"
              title={t('dashboard.toggleTheme')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {geo && (
              <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{geo.city}, {geo.country}</span>
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <button 
                  onClick={logout}
                  className="apple-button p-3 bg-secondary hover:bg-muted rounded-2xl"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="apple-button flex items-center gap-2.5 px-5 py-2.5 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold hover:opacity-90"
              >
                <LogIn className="w-4.5 h-4.5" />
                {t('dashboard.signIn')}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}