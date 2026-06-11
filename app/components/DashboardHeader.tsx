'use client';

import { Activity, Bell, LogIn, LogOut, Sun, Moon, MapPin } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 md:px-10 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Activity className="size-5 text-primary" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-semibold tracking-tight">
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
            className="relative"
            aria-label={t('alerts.alertsLabel')}
          >
            <Bell className="size-5" />
            {alerts.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                {alerts.length}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={t('dashboard.toggleTheme')}
          >
            {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>

          {geo && (
            <div className="hidden lg:flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              <span>
                {geo.city}, {geo.country}
              </span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight">{user.displayName}</p>
                <p className="text-xs text-muted-foreground leading-tight">{user.email}</p>
              </div>
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={logout} aria-label="logout">
                <LogOut className="size-5" />
              </Button>
            </div>
          ) : (
            <Button onClick={login} className="gap-2">
              <LogIn className="size-4" />
              <span className="hidden sm:inline">{t('dashboard.signIn')}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
