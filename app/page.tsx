// app/page.tsx v2.1.0
'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  setDoc, 
  doc, 
  addDoc, 
  serverTimestamp,
  where,
  updateDoc
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { db, auth, googleProvider } from './lib/firebase';
import { 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  RefreshCw, 
  LogIn, 
  LogOut,
  Zap,
  Globe,
  Sun,
  Moon,
  MapPin,
  Settings,
  Bell,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApiStatus {
  id: string;
  name: string;
  provider: string;
  status: 'online' | 'offline' | 'degraded';
  latency: number;
  lastChecked: string;
}

interface Alert {
  id: string;
  apiId: string;
  apiName: string;
  type: 'downtime' | 'latency';
  message: string;
  timestamp: any;
  resolved: boolean;
}

interface GeoInfo {
  city?: string;
  country?: string;
  ip?: string;
}

const LATENCY_THRESHOLD = 1500;

export default function Dashboard() {
  const [statuses, setStatuses] = useState<ApiStatus[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [geo, setGeo] = useState<GeoInfo | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setGeo({ city: data.city, country: data.country_name, ip: data.ip }))
      .catch(() => setGeo({ city: 'Unknown', country: 'Global' }));
  }, []);

  const runCheck = useCallback(async () => {
    if (!auth.currentUser) return;
    
    setIsChecking(true);
    try {
      const res = await fetch('/api/check');
      const results: ApiStatus[] = await res.json();
      
      for (const result of results) {
        await setDoc(doc(db, 'api_status', result.id), result);
        await addDoc(collection(db, 'status_history'), {
          apiId: result.id,
          status: result.status,
          latency: result.latency,
          timestamp: serverTimestamp(),
        });

        // Alert Logic
        if (result.status === 'offline') {
          await addDoc(collection(db, 'alerts'), {
            apiId: result.id,
            apiName: result.name,
            type: 'downtime',
            message: `${result.name} is currently offline.`,
            timestamp: serverTimestamp(),
            resolved: false
          });
        } else if (result.latency > LATENCY_THRESHOLD) {
          await addDoc(collection(db, 'alerts'), {
            apiId: result.id,
            apiName: result.name,
            type: 'latency',
            message: `${result.name} latency is high: ${result.latency}ms.`,
            timestamp: serverTimestamp(),
            resolved: false
          });
        }
      }
    } catch (error) {
      console.error('Check failed:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));
    
    const qStatus = query(collection(db, 'api_status'));
    const unsubscribeStatus = onSnapshot(qStatus, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as ApiStatus);
      setStatuses(data.sort((a, b) => a.name.localeCompare(b.name)));
      setLastUpdate(new Date());
    });

    const qHistory = query(
      collection(db, 'status_history'), 
      orderBy('timestamp', 'desc'), 
      limit(100)
    );
    const unsubscribeHistory = onSnapshot(qHistory, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          ...d,
          time: d.timestamp ? format(d.timestamp.toDate(), 'HH:mm:ss') : '',
          timestamp: d.timestamp?.toDate()
        };
      }).reverse();
      setHistory(data);
    });

    const qAlerts = query(
      collection(db, 'alerts'),
      where('resolved', '==', false),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubscribeAlerts = onSnapshot(qAlerts, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Alert));
      setAlerts(data);
    });

    let interval: NodeJS.Timeout;
    if (user) {
      interval = setInterval(() => {
        runCheck();
      }, 5 * 60 * 1000);
    }

    return () => {
      unsubscribeAuth();
      unsubscribeStatus();
      unsubscribeHistory();
      unsubscribeAlerts();
      if (interval) clearInterval(interval);
    };
  }, [user, runCheck]);

  const resolveAlert = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'alerts', id), { resolved: true });
  };

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  const chartData = history.reduce((acc: any[], curr) => {
    const time = curr.time;
    let existing = acc.find(a => a.time === time);
    if (!existing) {
      existing = { time };
      acc.push(existing);
    }
    existing[curr.apiId] = curr.latency;
    return acc;
  }, []);

  if (!mounted) return null;

  return (
    <div id="app-container" className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header id="main-header" className="border-b border-border p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div id="brand-section" className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight uppercase italic font-serif">LLM Sentinel</h1>
            <p className="mono-label">Global API Monitoring System v2.1.0</p>
          </div>
        </div>
        
        <div id="controls-section" className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            {/* Alerts Bell */}
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
                <div id="alerts-dropdown" className="absolute right-0 mt-2 w-72 sm:w-80 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-border flex justify-between items-center bg-muted/30">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Active Alerts</span>
                    <button onClick={() => setShowAlerts(false)} className="opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {alerts.length > 0 ? alerts.map(alert => (
                      <div key={alert.id} className="p-3 border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                        <div className="flex gap-3">
                          <div className={cn(
                            "mt-0.5",
                            alert.type === 'downtime' ? "text-rose-500" : "text-amber-500"
                          )}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] font-bold leading-tight mb-1">{alert.message}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] opacity-50 font-mono">
                                {alert.timestamp ? format(alert.timestamp.toDate(), 'HH:mm:ss') : 'Just now'}
                              </span>
                              <button 
                                onClick={() => resolveAlert(alert.id)}
                                className="text-[9px] font-bold uppercase text-emerald-500 hover:underline"
                              >
                                Resolve
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center opacity-30">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-[10px] uppercase font-mono">All systems operational</p>
                      </div>
                    )}
                  </div>
                </div>
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

      <main id="main-content" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Active Alerts Banner */}
        {alerts.length > 0 && (
          <div id="alerts-banner" className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                System Alert: {alerts.length} active issue{alerts.length > 1 ? 's' : ''} detected
              </p>
            </div>
            <button onClick={() => setShowAlerts(true)} className="text-[10px] font-bold uppercase underline text-rose-500">View Details</button>
          </div>
        )}

        {/* Stats Grid */}
        <section id="status-grid-section">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-2">
            <h2 className="text-xs font-mono uppercase opacity-50 tracking-widest italic font-serif">Current Status</h2>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              {lastUpdate && (
                <span className="text-[10px] font-mono opacity-50">
                  SYNC: {format(lastUpdate, 'HH:mm:ss')}
                </span>
              )}
              <button 
                onClick={runCheck}
                disabled={isChecking || !user}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 border border-border text-[10px] font-bold uppercase tracking-widest transition-all rounded-md",
                  isChecking ? "opacity-50 cursor-not-allowed" : "hover:bg-foreground hover:text-background",
                  !user && "opacity-30 cursor-not-allowed"
                )}
              >
                <RefreshCw className={cn("w-3 h-3", isChecking && "animate-spin")} />
                {isChecking ? 'Checking...' : 'Trigger'}
              </button>
            </div>
          </div>

          <div id="api-cards-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {statuses.length > 0 ? statuses.map((api) => (
              <div key={api.id} id={`api-card-${api.id}`} className="sentinel-card group cursor-default rounded-lg bg-card text-card-foreground">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="mono-label">{api.provider}</p>
                    <h3 className="font-bold text-base md:text-lg leading-tight">{api.name}</h3>
                  </div>
                  {api.status === 'online' ? (
                    api.latency > LATENCY_THRESHOLD ? (
                      <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    )
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-t border-border/10 pt-2">
                    <span className="text-[10px] font-mono opacity-50 uppercase">Status</span>
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
                      api.status === 'online' ? (api.latency > LATENCY_THRESHOLD ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500") : "bg-rose-500/10 text-rose-500"
                    )}>
                      {api.status === 'online' && api.latency > LATENCY_THRESHOLD ? 'degraded' : api.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono opacity-50 uppercase">Latency</span>
                    <span className={cn(
                      "text-xs font-mono font-bold",
                      api.latency > LATENCY_THRESHOLD ? "text-amber-500" : ""
                    )}>{api.latency}ms</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full border border-dashed border-border/30 p-12 text-center rounded-lg">
                <Globe className="w-8 h-8 mx-auto mb-4 opacity-20" />
                <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">No data available. Sign in to trigger.</p>
              </div>
            )}
          </div>
        </section>

        {/* History Chart */}
        <section id="history-chart-section" className="border border-border bg-card/50 p-4 md:p-6 rounded-lg">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
            <h2 className="text-xs font-mono uppercase opacity-50 tracking-widest italic font-serif">Latency History (ms)</h2>
            <div id="chart-legend" className="flex flex-wrap gap-x-4 gap-y-2 max-w-full">
              {statuses.slice(0, 8).map(s => (
                <div key={s.id} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getApiColor(s.id) }} />
                  <span className="text-[9px] font-mono opacity-50 uppercase whitespace-nowrap">{s.name}</span>
                </div>
              ))}
              {statuses.length > 8 && <span className="text-[9px] font-mono opacity-30 uppercase">+{statuses.length - 8} more</span>}
            </div>
          </div>

          <div id="chart-container" className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  {statuses.map(s => (
                    <linearGradient key={`grad-${s.id}`} id={`color-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getApiColor(s.id)} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={getApiColor(s.id)} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
                <XAxis 
                  dataKey="time" 
                  axisLine={{ stroke: 'currentColor', opacity: 0.1 }}
                  tickLine={false}
                  tick={{ fontSize: 9, fontFamily: 'monospace', fill: 'currentColor', opacity: 0.4 }}
                />
                <YAxis 
                  axisLine={{ stroke: 'currentColor', opacity: 0.1 }}
                  tickLine={false}
                  tick={{ fontSize: 9, fontFamily: 'monospace', fill: 'currentColor', opacity: 0.4 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '9px',
                    color: 'var(--foreground)'
                  }}
                  itemStyle={{ padding: '0px' }}
                />
                {statuses.map(s => (
                  <Area
                    key={s.id}
                    type="monotone"
                    dataKey={s.id}
                    stroke={getApiColor(s.id)}
                    fillOpacity={1}
                    fill={`url(#color-${s.id})`}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 0 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Footer */}
        <footer id="main-footer" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-8 border-t border-border/10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest">Global Coverage</h4>
            </div>
            <p className="text-[11px] leading-relaxed opacity-60">
              Monitoring major AI providers across US and China. We track reachability and latency for OpenAI, Anthropic, Google, Moonshot, Zhipu, and more.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest">Adaptive UI</h4>
            </div>
            <p className="text-[11px] leading-relaxed opacity-60">
              Optimized for all devices. Features dark/light mode switching and high-readability typography for technical monitoring environments.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest">Data Integrity</h4>
            </div>
            <p className="text-[11px] leading-relaxed opacity-60">
              Historical data is persisted via Firebase. Manual triggers require authentication to prevent API abuse while maintaining public transparency.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function getApiColor(id: string) {
  const colors: Record<string, string> = {
    'openai-gpt-4o': '#10a37f',
    'anthropic-claude-3-5': '#d97757',
    'google-gemini-1-5': '#4285f4',
    'meta-llama-3': '#0668E1',
    'mistral-large': '#F5D140',
    'moonshot-v1': '#FF5C00',
    'zhipu-glm-4': '#3B82F6',
    'baichuan-2': '#EF4444',
    'qwen-max': '#8B5CF6',
    'hunyuan-pro': '#0052D9',
    'ernie-4': '#2932E1',
    'deepseek-v3': '#6366f1'
  };
  return colors[id] || '#141414';
}
