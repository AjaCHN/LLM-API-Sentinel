// app/[locale]/settings/page.tsx v3.4.7
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useDashboardData } from '../../hooks/useDashboardData';
import DashboardHeader from '../../components/DashboardHeader';
import DashboardFooter from '../../components/DashboardFooter';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useTranslations } from 'next-intl';
import { Settings as SettingsIcon, Bell, Shield, Eye, Database, Save, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';

export default function SettingsPage() {
  const { user, alerts, geo, login, logout, resolveAlert } = useDashboardData();
  const t = useTranslations('settings');
  const [showAlerts, setShowAlerts] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    latencyThreshold: 1500,
    enableEmailAlerts: true,
    enableInAppAlerts: true,
    refreshInterval: 5
  });

  useEffect(() => {
    setMounted(true);
    if (user) {
      const fetchPrefs = async () => {
        try {
          const docRef = doc(db, 'user_preferences', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPreferences(docSnap.data() as any);
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, `user_preferences/${user.uid}`);
        }
      };
      fetchPrefs();
    }
  }, [user]);

  const savePreferences = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'user_preferences', user.uid), {
        ...preferences,
        userId: user.uid,
        email: user.email,
        updatedAt: new Date().toISOString()
      });
      alert(t('settingsSaved'));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `user_preferences/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold tracking-tight">请先登录 (Please Sign In)</h1>
          <button onClick={login} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-md uppercase tracking-widest text-xs">登录 (Sign In)</button>
        </div>
      </div>
    );
  }

  return (
    <div id="settings-container" className="min-h-screen bg-background text-foreground transition-colors duration-300">
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
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">{t('configureMonitoring')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Tabs */}
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium bg-primary/10 text-primary rounded-lg">
                <Bell className="w-4 h-4" /> {t('alerts')}
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
                <Eye className="w-4 h-4" /> {t('display')}
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
                <Shield className="w-4 h-4" /> {t('security')}
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
                <Database className="w-4 h-4" /> {t('data')}
              </button>
            </div>

            {/* Content Area */}
            <div className="md:col-span-3 space-y-6">
              <div className="border border-border bg-card rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3 className="text-sm font-bold uppercase tracking-widest">{t('thresholds')}</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">{t('latencyThreshold')}</label>
                    <input 
                      type="number" 
                      value={preferences.latencyThreshold}
                      onChange={(e) => setPreferences({...preferences, latencyThreshold: parseInt(e.target.value)})}
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <p className="text-[10px] text-muted-foreground">{t('latencyDesc')}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">{t('refreshInterval')}</label>
                    <select 
                      value={preferences.refreshInterval}
                      onChange={(e) => setPreferences({...preferences, refreshInterval: parseInt(e.target.value)})}
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      <option value={1}>1 {t('minute')}</option>
                      <option value={5}>5 {t('minutes')}</option>
                      <option value={15}>15 {t('minutes')}</option>
                      <option value={30}>30 {t('minutes')}</option>
                    </select>
                  </div>

                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t('enableEmailAlerts')}</p>
                        <p className="text-[10px] text-muted-foreground">{t('emailAlertsDesc')}</p>
                      </div>
                      <button 
                        onClick={() => setPreferences({...preferences, enableEmailAlerts: !preferences.enableEmailAlerts})}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative",
                          preferences.enableEmailAlerts ? "bg-primary" : "bg-muted"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          preferences.enableEmailAlerts ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t('enableInAppAlerts')}</p>
                        <p className="text-[10px] text-muted-foreground">{t('inAppAlertsDesc')}</p>
                      </div>
                      <button 
                        onClick={() => setPreferences({...preferences, enableInAppAlerts: !preferences.enableInAppAlerts})}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative",
                          preferences.enableInAppAlerts ? "bg-primary" : "bg-muted"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          preferences.enableInAppAlerts ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-muted/30 border-t border-border flex justify-end">
                  <button 
                    onClick={savePreferences}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {saving ? t('saving') : <><Save className="w-4 h-4" /> {t('saveSettings')}</>}
                  </button>
                </div>
              </div>

              <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-500/80 leading-relaxed">
                  {t('note')}
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
