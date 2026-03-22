// app/[locale]/profile/page.tsx v1.0.0
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useDashboardData } from '../../hooks/useDashboardData';
import DashboardHeader from '../../components/DashboardHeader';
import DashboardFooter from '../../components/DashboardFooter';
import ErrorBoundary from '../../components/ErrorBoundary';
import { User, Mail, Shield, Calendar, MapPin, Activity, Bell, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProfilePage() {
  const { user, alerts, geo, login, logout, resolveAlert } = useDashboardData();
  const [showAlerts, setShowAlerts] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [formattedDates, setFormattedDates] = useState({ joined: '', lastLogin: '' });
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (user) {
      const joinedDate = user.metadata.creationTime || user.metadata.lastSignInTime || new Date().toISOString();
      const lastLoginDate = user.metadata.lastSignInTime || user.metadata.creationTime || new Date().toISOString();
      setFormattedDates({
        joined: format(new Date(joinedDate), 'MMM yyyy'),
        lastLogin: format(new Date(lastLoginDate), 'yyyy-MM-dd HH:mm:ss')
      });
    }
  }, [user]);

  if (!mounted) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">请先登录 (Please Sign In)</h1>
          <p className="text-muted-foreground text-sm">
            您需要登录后才能查看个人资料。
            <br />
            You need to sign in to view your profile.
          </p>
          <button 
            onClick={login}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-md hover:opacity-90 transition-opacity uppercase tracking-widest text-xs"
          >
            立即登录 (Sign In Now)
          </button>
          <Link href={`/${locale}`} className="block text-xs text-muted-foreground hover:underline">
            返回首页 (Back to Home)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id="profile-container" className="min-h-screen bg-background text-foreground transition-colors duration-300">
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

      <main className="p-4 md:p-6 max-w-4xl mx-auto space-y-8 py-12">
        <ErrorBoundary>
          {/* Profile Header Card */}
          <section className="relative overflow-hidden border border-border bg-card rounded-2xl shadow-sm">
            <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
            <div className="px-6 pb-8 -mt-12 flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl border-4 border-background bg-muted overflow-hidden shadow-lg">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <User className="w-12 h-12 text-primary" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-2 border-background rounded-full" title="Online" />
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">{user.displayName || 'User'}</h1>
                <p className="text-muted-foreground font-mono text-sm">{user.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    <Shield className="w-3 h-3" /> Administrator
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                    <Calendar className="w-3 h-3" /> Joined {formattedDates.joined}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link 
                  href={`/${locale}/settings`}
                  className="p-2 border border-border hover:bg-muted rounded-lg transition-colors"
                  title="Settings"
                >
                  <SettingsIcon className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Info Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="border border-border bg-card rounded-xl p-6 space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> 账户详情 (Account Details)
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold opacity-50">用户 ID (User ID)</p>
                    <p className="font-mono text-xs truncate bg-muted p-2 rounded border border-border">{user.uid}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold opacity-50">电子邮箱 (Email Address)</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{user.email}</p>
                      {user.emailVerified && <Shield className="w-3 h-3 text-emerald-500" />}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold opacity-50">最后登录 (Last Login)</p>
                    <p className="text-sm">{formattedDates.lastLogin}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold opacity-50">当前位置 (Current Location)</p>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3 h-3 opacity-50" />
                      {geo ? `${geo.city}, ${geo.country}` : 'Detecting...'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-border bg-card rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" /> 最近活动 (Recent Activity)
                </h2>
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground italic">暂无最近活动记录 (No recent activity recorded).</p>
                </div>
              </div>
            </div>

            {/* Sidebar / Quick Actions */}
            <div className="space-y-6">
              <div className="border border-border bg-card rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest">快速操作 (Quick Actions)</h2>
                <div className="space-y-2">
                  <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors text-xs font-medium">
                    <span>切换主题 (Toggle Theme)</span>
                    <span className="opacity-50 uppercase">{theme}</span>
                  </button>
                  <Link href={`/${locale}`} className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors text-xs font-medium">
                    <span>返回控制台 (Back to Dashboard)</span>
                  </Link>
                  <button onClick={logout} className="w-full flex items-center justify-between p-3 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-xs font-medium">
                    <span>退出登录 (Sign Out)</span>
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="border border-border bg-primary/5 rounded-xl p-6 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-tighter text-primary">Sentinel Pro</h3>
                <p className="text-[10px] leading-relaxed opacity-70">
                  您的账户当前处于专业版监控状态。所有 API 请求均已加密并记录。
                  Your account is currently under Pro monitoring.
                </p>
              </div>
            </div>
          </div>
        </ErrorBoundary>

        <DashboardFooter />
      </main>
    </div>
  );
}
