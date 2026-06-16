'use client';

import { Activity, Bell, LogIn, LogOut, Sun, Moon, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Alert, User } from '@/types';
import { useI18n } from '@/hooks/useI18n';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolveAlert?: (id: string) => Promise<void>;
}

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
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
}: DashboardHeaderProps) {
  const { t } = useI18n();
  const hasCriticalAlerts = alerts.some(a => a.severity === 'critical' || a.severity === 'high');

  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 md:px-10 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 transition-transform duration-300 group-hover:scale-105">
              <Activity className="size-5 text-primary" />
            </div>
            <div className="absolute -inset-1 rounded-xl bg-primary/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold tracking-tight">
              {t('dashboard.title')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.globalAIApiMonitoring')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAlerts(!showAlerts)}
            className={cn(
              'relative transition-all duration-300',
              hasCriticalAlerts && 'animate-pulse'
            )}
            aria-label={t('alerts.alertsLabel')}
          >
            <Bell className={cn(
              'size-5 transition-colors',
              hasCriticalAlerts && 'text-amber-500'
            )} />
            {alerts.length > 0 && (
              <span className={cn(
                'absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full text-[10px] font-bold',
                hasCriticalAlerts 
                  ? 'bg-destructive text-destructive-foreground animate-pulse' 
                  : 'bg-primary text-primary-foreground'
              )}>
                {alerts.length}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={t('dashboard.toggleTheme')}
            className="group"
          >
            <div className="relative">
              {theme === 'dark' ? (
                <Sun className="size-5 transition-colors group-hover:text-amber-400" />
              ) : (
                <Moon className="size-5 transition-colors group-hover:text-indigo-400" />
              )}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
              </div>
            </div>
          </Button>

          {geo && (
            <div className="hidden lg:flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm border border-border/20">
              <MapPin className="size-3.5 text-primary" />
              <span className="font-medium">{geo.city}, {geo.country}</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight">{user.displayName}</p>
                <p className="text-xs text-muted-foreground leading-tight">{user.email}</p>
              </div>
              <div className="relative group">
                <Avatar className="size-8 border border-border/30 transition-all duration-300 group-hover:border-primary/50 group-hover:scale-105">
                  <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout} 
                aria-label="logout"
                className="group"
              >
                <LogOut className="size-5 transition-colors group-hover:text-destructive" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={login} 
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/30 hover:scale-105"
            >
              <LogIn className="size-4" />
              <span className="hidden sm:inline font-semibold">{t('dashboard.signIn')}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
