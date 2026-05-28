// app/components/DashboardHeader.tsx v2.5.1
'use client';

import React from 'react';
import { Activity, Bell, LogIn, LogOut, Sun, Moon, MapPin } from 'lucide-react';
import AlertsDropdown from './AlertsDropdown';
import { Alert } from '../types';
import { User } from 'firebase/auth';

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
  
  return (
    <div id="main-header" className="border-b border-border p-3 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <div id="brand-section" className="flex items-center gap-3 w-full md:w-auto">
        <Activity className="w-6 h-6 md:w-8 md:h-8 text-primary" />
        <div>
          <h1 className="text-lg md:text-xl md:text-2xl font-bold tracking-tight uppercase italic font-serif">LLM API Sentinel</h1>
          <p className="mono-label">Global AI API Monitoring</p>
        </div>
      </div>
      
      <div id="controls-section" className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={() => setShowAlerts(!showAlerts)}
              className="p-1.5 md:p-2 border border-border hover:bg-foreground hover:text-background transition-colors rounded-md relative"
              title="Alerts"
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[7px] md:text-[8px] font-bold flex items-center justify-center rounded-full animate-pulse">
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
            className="p-1.5 md:p-2 border border-border hover:bg-foreground hover:text-background transition-colors rounded-md"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          {geo && (
            <div className="hidden lg:flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 border border-border rounded-md bg-muted/30">
              <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 opacity-50" />
              <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-tighter">{geo.city}, {geo.country}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <div className="flex items-center gap-2 md:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold leading-none mb-1">{user.displayName}</p>
                <p className="text-[9px] opacity-50 font-mono leading-none">{user.email}</p>
              </div>
              <button 
                onClick={logout}
                className="p-1.5 md:p-2 border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors rounded-md"
              >
                <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 border border-border hover:bg-foreground hover:text-background transition-colors uppercase text-[9px] md:text-[10px] font-bold tracking-widest rounded-md"
            >
              <LogIn className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
