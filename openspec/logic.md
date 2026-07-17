# 逻辑与服务文档

## 1. 核心服务架构

LLM API Sentinel 的核心逻辑由多个服务和钩子组成，负责处理监控、数据管理、认证等功能。

```mermaid
graph TD
    subgraph Services[核心服务]
        Monitor[监控服务]
        Cache[缓存服务]
        Metrics[指标计算]
        ErrorHandler[错误处理]
        Notification[通知服务]
    end
    
    subgraph Hooks[自定义钩子]
        useDashboard[useDashboardData]
        useApi[useApiMonitor]
        useAuth[useAuth]
        useAlerts[useAlerts]
        useGeo[useGeoLocation]
    end
    
    subgraph Store[状态管理]
        ApiStore[api.ts]
        AuthStore[auth.ts]
        AlertsStore[alerts.ts]
        GeoStore[geo.ts]
        ErrorStore[error.ts]
    end
    
    Monitor --> Cache
    Monitor --> Metrics
    Monitor --> ErrorHandler
    
    useDashboard --> ApiStore
    useDashboard --> AuthStore
    useDashboard --> AlertsStore
    useDashboard --> GeoStore
    
    useApi --> Monitor
    useApi --> Cache
    
    useAuth --> AuthStore
    useAlerts --> AlertsStore
    useGeo --> GeoStore
    
    ErrorHandler --> ErrorStore
    Notification --> ErrorStore
```

## 2. 监控服务

### 2.1 核心监控流程

```mermaid
flowchart TD
    A[触发检查] --> B[获取 API 列表]
    B --> C[初始化并发管理器]
    C --> D[遍历 API 列表]
    
    D --> E{还有 API?}
    E -->|是| F[检查缓存]
    E -->|否| G[返回结果]
    
    F -->|缓存有效| H[使用缓存]
    F -->|缓存无效| I[执行 HTTP 请求]
    
    I --> J{请求成功?}
    J -->|是| K[计算状态]
    J -->|否| L[记录错误]
    
    K --> M[更新缓存]
    L --> M
    
    M --> N[更新指标]
    N --> O[检测告警条件]
    
    O --> P[生成告警]
    P --> D
    
    H --> N
```

### 2.2 并发控制

**并发管理器** (`app/lib/concurrency.ts`) 负责控制同时进行的 API 检查数量，避免请求过多被限流。

```typescript
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    priority?: 'low' | 'medium' | 'high';
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  }
): Promise<R[]> {
  // 并发控制逻辑
}
```

**配置参数**：
| 参数 | 默认值 | 说明 |
|-----|-------|------|
| `priority` | 'medium' | 优先级 |
| `timeout` | 30000 | 超时时间(ms) |
| `retries` | 1 | 重试次数 |
| `retryDelay` | 1000 | 重试延迟(ms) |

### 2.3 单个 API 检查

**检查流程**：
```typescript
async function checkApi(api: ApiConfig, retries: number = 0): Promise<ApiStatus> {
  // 1. 检查缓存
  const cached = getCache(api.id);
  if (cached) return cached;
  
  // 2. 执行请求
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    
    const response = await fetch(api.url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - start;
    
    // 3. 判断状态
    const isOnline = response.status < 500;
    
    // 4. 重试逻辑
    if (!isOnline && retries < MAX_RETRIES) {
      await delay(RETRY_DELAY);
      return checkApi(api, retries + 1);
    }
    
    // 5. 返回结果
    return {
      ...api,
      status: isOnline ? 'online' : 'offline',
      latency,
      lastChecked: new Date().toISOString(),
      retries,
    };
  } catch (error) {
    // 错误处理
    if (retries < MAX_RETRIES) {
      await delay(RETRY_DELAY);
      return checkApi(api, retries + 1);
    }
    
    return {
      ...api,
      status: 'offline',
      latency: 0,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      retries,
    };
  }
}
```

## 3. 缓存服务

### 3.1 多层缓存架构

```mermaid
graph TD
    subgraph CacheLayers
        Memory[内存缓存]
        LocalStorage[localStorage]
        SessionStorage[sessionStorage]
    end
    
    subgraph CachePolicy
        Default[默认 30s]
        Online[在线 & 低延迟\n60s]
        Offline[离线\n5s]
    end
    
    App[应用] --> Memory
    Memory -->|未命中| LocalStorage
    LocalStorage -->|未命中| Remote[远程数据]
    
    Remote --> Memory
    Memory --> LocalStorage
    Memory --> SessionStorage
```

### 3.2 缓存操作

```typescript
// 获取缓存
export function getCache(apiId: string): ApiStatus | null {
  const cached = memoryCache[apiId];
  if (cached && isCacheValid(cached)) {
    return cached.result;
  }
  return null;
}

// 设置缓存
export function setCache(apiId: string, result: ApiStatus): void {
  const expiry = calculateCacheExpiry(apiId, result.status, result.latency);
  memoryCache[apiId] = { result, timestamp: Date.now(), expiry };
  saveCacheToStorage(memoryCache);
}

// 初始化缓存
export function initializeCache(): void {
  memoryCache = loadCacheFromStorage();
}
```

### 3.3 智能缓存过期策略

| 条件 | 过期时间 | 说明 |
|-----|---------|------|
| online + latency < 100ms | 60 秒 | 快速响应，延长缓存 |
| online + latency 100-1000ms | 30 秒 | 默认缓存时间 |
| online + latency > 1000ms | 15 秒 | 高延迟，缩短缓存 |
| degraded | 15 秒 | 降级状态 |
| offline | 5 秒 | 离线状态，快速重试 |

## 4. 指标计算服务

### 4.1 指标类型

| 指标 | 计算方式 | 说明 |
|-----|---------|------|
| **errorRate** | 错误请求数 / 总请求数 | 错误率百分比 |
| **availability** | 可用时间 / 总时间 | 可用性百分比 |
| **uptime** | 正常运行时间 / 总时间 | 正常运行时间百分比 |
| **averageLatency** | 总延迟 / 请求次数 | 平均延迟 |
| **maxLatency** | 最大延迟值 | 最大延迟 |
| **minLatency** | 最小延迟值 | 最小延迟 |

### 4.2 指标计算逻辑

```typescript
export async function calculateMetrics(apiId: string): Promise<Metrics> {
  // 从历史数据计算指标
  const history = await getHistoryData(apiId);
  
  const totalRequests = history.length;
  const successfulRequests = history.filter(h => h.status === 'online').length;
  const latencies = history.map(h => h.latency);
  
  return {
    errorRate: totalRequests > 0 ? ((totalRequests - successfulRequests) / totalRequests) * 100 : 0,
    availability: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 100,
    uptime: 100, // 需要更复杂的计算
    averageLatency: latencies.length > 0 
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length 
      : 0,
    maxLatency: latencies.length > 0 ? Math.max(...latencies) : 0,
    minLatency: latencies.length > 0 ? Math.min(...latencies) : 0,
  };
}
```

## 5. 错误处理服务

### 5.1 错误分类

| 错误类型 | 代码 | 处理方式 |
|---------|------|---------|
| **网络错误** | `NETWORK_TIMEOUT` | 重试 + 降级显示 |
| **网络错误** | `NETWORK_OFFLINE` | 显示离线提示 |
| **API 错误** | `API_UNAVAILABLE` | 记录日志 + 告警 |
| **API 错误** | `API_RATE_LIMITED` | 延迟重试 |
| **认证错误** | `AUTH_REQUIRED` | 显示登录提示 |
| **Supabase 错误** | `SUPABASE_ERROR` | 重试 + 错误日志 |
| **未知错误** | `UNKNOWN_ERROR` | 记录 + 通知 |

### 5.2 错误处理流程

```mermaid
flowchart TD
    A[捕获错误] --> B[分类错误]
    
    B --> C{错误类型}
    
    C -->|网络错误| D[检查重试次数]
    C -->|API 错误| E[记录日志]
    C -->|认证错误| F[显示登录提示]
    C -->|其他错误| G[记录日志 + 通知]
    
    D -->|可重试| H[执行重试]
    D -->|超过限制| I[返回降级数据]
    
    H --> J{重试成功?}
    J -->|是| K[返回结果]
    J -->|否| I
    
    E --> L[触发告警]
    L --> M[返回降级数据]
    
    I --> N[显示错误提示]
    G --> N
```

### 5.3 错误边界

```typescript
// ErrorBoundary 组件
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## 6. 通知服务

### 6.1 通知类型

| 类型 | 触发条件 | 显示方式 |
|-----|---------|---------|
| **告警通知** | 新告警创建 | 横幅 + 铃铛 |
| **错误通知** | 操作失败 | Toast |
| **成功通知** | 操作成功 | Toast |
| **信息通知** | 状态变更 | Toast |

### 6.2 通知管理

```typescript
// 显示通知
export function showNotification(message: string, type: NotificationType = 'info') {
  const notification = {
    id: Date.now().toString(),
    message,
    type,
    timestamp: new Date(),
  };
  
  // 添加到状态
  addNotification(notification);
  
  // 自动移除
  setTimeout(() => {
    removeNotification(notification.id);
  }, 5000);
}

// 发送告警通知
export async function sendAlertNotification(alert: Alert) {
  // 显示 UI 通知
  showNotification(alert.message, 'error');
  
  // 可选：发送邮件/短信通知
  if (alert.severity === 'critical' || alert.severity === 'high') {
    await sendEmailNotification(alert);
  }
}
```

## 7. 自定义 Hooks

### 7.1 useDashboardData

**功能**：统一获取仪表盘所需的所有数据

```typescript
export function useDashboardData() {
  const [statuses, setStatuses] = useState<ApiStatus[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [geo, setGeo] = useState<GeoInfo | null>(null);

  // 从 Supabase 实时获取数据
  useEffect(() => {
    const channel = supabase
      .channel('api_status')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'api_status'
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setStatuses(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
        }
        setLastUpdate(new Date());
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // 获取用户认证状态
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  // 获取地理位置
  useEffect(() => {
    getGeoLocation().then(setGeo);
  }, []);

  // 执行检查
  const runCheck = async () => {
    if (!user) {
      showNotification('Please login to run manual check', 'error');
      return;
    }
    
    setIsChecking(true);
    try {
      const results = await performCheck();
      await updateStatuses(results);
    } finally {
      setIsChecking(false);
    }
  };

  // 解决告警
  const resolveAlert = async (id: string) => {
    await supabase.from('alerts').update({
      resolved: true,
      resolved_at: new Date().toISOString(),
    }).eq('id', id);
  };

  return {
    statuses,
    history,
    alerts,
    user,
    isChecking,
    lastUpdate,
    geo,
    runCheck,
    resolveAlert,
    login: signInWithGoogle,
    logout: signOut,
  };
}
```

### 7.2 useApiMonitor

**功能**：管理 API 监控逻辑，从 Supabase 读取状态

```typescript
export function useApiMonitor() {
  const [statuses, setStatuses] = useState<ApiStatus[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // 订阅 API 状态
  useEffect(() => {
    const channel = supabase
      .channel('api_status')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'api_status'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setStatuses(prev => [...prev, payload.new as ApiStatus]);
        } else if (payload.eventType === 'UPDATE') {
          setStatuses(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // 获取历史数据
  const fetchHistory = async () => {
    const { data } = await supabase
      .from('status_history')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);
    
    if (data) {
      setHistory(data as StatusHistory[]);
    }
  };

  // 执行检查
  const runCheck = async () => {
    setIsChecking(true);
    try {
      await performCheck();
      await fetchHistory();
    } finally {
      setIsChecking(false);
    }
  };

  return { statuses, history, isChecking, runCheck, fetchHistory };
}
```

### 7.3 useAuth

**功能**：管理 Supabase Auth 认证状态

```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取初始会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google'
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, login, logout };
}
```

### 7.4 useAlerts

**功能**：管理告警状态和操作

```typescript
export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel('alerts')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'alerts',
        filter: 'resolved=eq.false'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAlerts(prev => [payload.new as Alert, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setAlerts(prev => prev.filter(a => a.id !== payload.new.id));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const resolveAlert = async (id: string) => {
    await supabase.from('alerts').update({
      resolved: true,
      resolved_at: new Date().toISOString(),
    }).eq('id', id);
  };

  return { alerts, resolveAlert };
}
```

### 7.5 useGeoLocation

**功能**：基于 IP 获取并缓存地理位置信息（使用 ipapi.co 服务）

```typescript
export function useGeoLocation() {
  const [geo, setGeo] = useState<GeoInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGeo = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Geo request failed');

      const data = await response.json();
      const geoInfo: GeoInfo = {
        city: data.city,
        region: data.region,
        country: data.country_name,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        timestamp: Date.now(),
      };
      setGeo(geoInfo);
      cacheGeoLocation(geoInfo);
    } catch (error) {
      logError(error, 'Failed to fetch geo location');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = getCachedGeoLocation();
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      setGeo(cached);
      setLoading(false);
      return;
    }
    fetchGeo();
  }, []);

  return { geo, loading, refreshGeo: fetchGeo };
}
```

## 8. 状态管理

### 8.1 Zustand Store 结构

```mermaid
graph TD
    RootStore[Zustand Root Store] --> api[api.ts]
    RootStore --> auth[auth.ts]
    RootStore --> alerts[alerts.ts]
    RootStore --> geo[geo.ts]
    RootStore --> error[error.ts]
    
    api --> statuses[statuses]
    api --> history[history]
    api --> isChecking[isChecking]
    
    auth --> user[user]
    auth --> loading[loading]
    
    alerts --> alertsList[alerts]
    
    geo --> geoInfo[geo]
    
    error --> errors[errors]
    error --> notifications[notifications]
```

### 8.2 Store 实现示例

```typescript
// api.ts
export const useApiStore = create((set) => ({
  statuses: [],
  history: [],
  isChecking: false,
  
  setStatuses: (statuses: ApiStatus[]) => set({ statuses }),
  setHistory: (history: StatusHistory[]) => set({ history }),
  setIsChecking: (isChecking: boolean) => set({ isChecking }),
  
  fetchStatuses: async () => {
    set({ isChecking: true });
    const statuses = await fetchApiStatuses();
    set({ statuses, isChecking: false });
  },
}));
```

## 9. 后台监控任务

### 9.1 任务调度

> **注意**：后台监控任务已从 server.ts 迁移到 Supabase Edge Functions。请参考 Supabase Edge Functions 文档。

### 9.2 批量写入 Supabase

```typescript
async function updateSupabase(results: ApiStatus[]) {
  const updates = results.map(result => ({
    id: result.id,
    name: result.name,
    provider: result.provider,
    url: result.url,
    status: result.status,
    latency: result.latency,
    lastChecked: new Date().toISOString(),
    error: result.error || null,
  }));

  const { error } = await supabase
    .from('api_status')
    .upsert(updates);

  if (error) {
    logError(error, '[Monitor] Failed to update statuses');
  }
}
```

### 9.3 智能告警逻辑

```typescript
async function handleAlerts(result: ApiStatus) {
  // 检查是否已有同类未解决告警
  const { data: existingAlerts } = await supabase
    .from('alerts')
    .select('id')
    .eq('apiId', result.id)
    .eq('resolved', false)
    .eq('type', getAlertType(result))
    .limit(1);

  if (existingAlerts && existingAlerts.length > 0) {
    return; // 已有同类告警，不重复创建
  }

  // 创建新告警
  if (result.status === 'offline') {
    await supabase.from('alerts').insert({
      apiId: result.id,
      apiName: result.name,
      type: 'downtime',
      severity: 'critical',
      message: `${result.name} is currently offline`,
      timestamp: new Date().toISOString(),
      resolved: false,
    });
  } else if (result.latency > LATENCY_THRESHOLD) {
    await supabase.from('alerts').insert({
      apiId: result.id,
      apiName: result.name,
      type: 'latency',
      severity: calculateSeverity(result.latency),
      message: `${result.name} latency is high: ${result.latency}ms`,
      timestamp: new Date().toISOString(),
      resolved: false,
      latency: result.latency,
    });
  }
}
```

## 10. 工具函数

### 10.1 时间格式化

```typescript
import { format, formatDistanceToNow } from 'date-fns';

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'HH:mm:ss');
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}
```

### 10.2 状态颜色映射

```typescript
export function getStatusColor(status: ApiStatus['status']): string {
  switch (status) {
    case 'online': return '#10B981';
    case 'offline': return '#EF4444';
    case 'degraded': return '#F59E0B';
    default: return '#6B7280';
  }
}

export function getStatusText(status: ApiStatus['status']): string {
  switch (status) {
    case 'online': return 'Online';
    case 'offline': return 'Offline';
    case 'degraded': return 'Degraded';
    default: return 'Unknown';
  }
}
```

### 10.3 延迟等级判断

```typescript
export function getLatencyLevel(latency: number): 'fast' | 'normal' | 'slow' | 'critical' {
  if (latency < 500) return 'fast';
  if (latency < 1000) return 'normal';
  if (latency < 1500) return 'slow';
  return 'critical';
}

export function getLatencyColor(latency: number): string {
  switch (getLatencyLevel(latency)) {
    case 'fast': return '#10B981';
    case 'normal': return '#3B82F6';
    case 'slow': return '#F59E0B';
    case 'critical': return '#EF4444';
  }
}
```