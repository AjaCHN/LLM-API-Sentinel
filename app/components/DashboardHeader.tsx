// app/components/DashboardHeader.tsx v2.3.0
'use client';

import { Activity, Bell, LogIn, LogOut, Sun, Moon, MapPin, X } from 'lucide-react';
import { cn } from '../lib/utils';
import AlertsDropdown from './AlertsDropdown';

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
}: any) {
  return (
    <header id="main-header" className="border-b border-border p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <div id="brand-section" className="flex items-center gap-3">
        <Activity className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight uppercase italic font-serif">LLM Sentinel</h1>
          <p className="mono-label">Global API Monitoring System v2.3.0</p>
        </div>
      </div>
      
      <div id="controls-section" className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={() => setShowAlerts(!showAlerts)}
              className="p-2 border border-border hover:bg-foreground hover:text-background transition-colors rounded-md relative"
              title="Alerts"
            >
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full animate-pulse">
                  {alerts.length}
                </span>
              )}
            </button>
            
            {showAlerts && (
              <AlertsDropdown alerts={alerts} onClose={() => setShowAlerts(false)} onResolve={resolveAlert} />
            )}
          </div>

          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 border border-border hover:bg-foreground hover:text-background transition-colors rounded-md"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {geo && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-muted/30">
              <MapPin className="w-3 h-3 opacity-50" />
              <span className="text-[10px] font-mono uppercase tracking-tighter">{geo.city}, {geo.country}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold leading-none mb-1">{user.displayName}</p>
                <p className="text-[9px] opacity-50 font-mono leading-none">{user.email}</p>
              </div>
              <button 
                onClick={logout}
                className="p-2 border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors rounded-md"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-foreground hover:text-background transition-colors uppercase text-[10px] font-bold tracking-widest rounded-md"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
