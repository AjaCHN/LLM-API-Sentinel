# 逻辑与服务

## useDashboardData (Dashboard Hook)
负责获取实时监控数据、处理告警逻辑及用户登录状态。

```typescript
// app/hooks/useDashboardData.ts
export function useDashboardData() {
  const [statuses, setStatuses] = useState<ApiStatus[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [geo, setGeo] = useState<GeoInfo | null>(null);

  // 从 Firestore 实时获取数据
  // 处理用户认证
  // 管理告警状态
  // 触发手动检查

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
    login, 
    logout 
  };
}
```

## 后台监控任务 (server.ts)
每 5 分钟执行一次 API 可用性检测。

```typescript
// server.ts
async function runBackgroundMonitor() {
  console.log('[Monitor] Starting background check...');
  try {
    const results = await performCheck();
    const batch = db.batch();

    for (const result of results) {
      const statusRef = db.collection('api_status').doc(result.id);
      batch.set(statusRef, result);

      const historyRef = db.collection('status_history').doc();
      batch.set(historyRef, {
        apiId: result.id,
        status: result.status,
        latency: result.latency,
        timestamp: FieldValue.serverTimestamp(),
      });

      // 告警逻辑
      if (result.status === 'offline') {
        const alertRef = db.collection('alerts').doc();
        batch.set(alertRef, {
          apiId: result.id,
          apiName: result.name,
          type: 'downtime',
          message: `${result.name} is currently offline. (Auto-detected)`,
          timestamp: FieldValue.serverTimestamp(),
          resolved: false
        });
      } else if (result.latency > LATENCY_THRESHOLD) {
        const alertRef = db.collection('alerts').doc();
        batch.set(alertRef, {
          apiId: result.id,
          apiName: result.name,
          type: 'latency',
          severity: calculateSeverity(result.latency),
          message: `${result.name} latency is high: ${result.latency}ms. (Auto-detected)`,
          timestamp: FieldValue.serverTimestamp(),
          resolved: false
        });
      }
    }

    await batch.commit();
    console.log('[Monitor] Background check completed and synced.');
  } catch (error) {
    console.error('[Monitor] Background check failed:', error);
  }
}
```

## performCheck (API 检查函数)
执行 API 检查，使用并发管理器控制请求数量，支持重试机制。

```typescript
// app/lib/monitor.ts
export async function performCheck() {
  const results = await processBatch(
    APIS_TO_CHECK,
    (api) => checkApiWithMetrics(api),
    {
      priority: 'medium',
      timeout: 30000,
      retries: 1,
      retryDelay: 1000
    }
  );
  return results;
}
```

## checkApi (单个 API 检查)
检查单个 API 的可用性和延迟，支持重试机制和缓存。

```typescript
// app/lib/monitor.ts
async function checkApi(api: typeof APIS_TO_CHECK[0], retries: number = 0): Promise<ApiStatus> {
  // 检查缓存
  const cachedResult = getCache(api.id);
  if (cachedResult) {
    return cachedResult;
  }

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
    const isOnline = response.status < 500;
    
    if (!isOnline && retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return checkApi(api, retries + 1);
    }
    
    const result: ApiStatus = {
      ...api,
      status: isOnline ? 'online' : 'offline',
      latency,
      lastChecked: new Date().toISOString(),
      retries,
    };

    // 更新缓存
    setCache(api.id, result);
    return result;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return checkApi(api, retries + 1);
    }
    
    const result: ApiStatus = {
      ...api,
      status: 'offline',
      latency: 0,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      retries,
    };

    // 更新缓存
    setCache(api.id, result);
    return result;
  }
}
```

## 缓存服务 (cache.ts)
提供内存和 localStorage 双层缓存机制。

```typescript
// app/lib/cache.ts
let memoryCache: ApiCheckCache = {};

export function getCache(apiId: string): ApiStatus | null {
  const cached = memoryCache[apiId];
  if (cached && isCacheValid(cached)) {
    return cached.result;
  }
  return null;
}

export function setCache(apiId: string, result: ApiStatus): void {
  const expiry = calculateCacheExpiry(apiId, result.status, result.latency);
  memoryCache[apiId] = { result, timestamp: Date.now(), expiry };
  saveCacheToStorage(memoryCache);
}

export function initializeCache(): void {
  memoryCache = loadCacheFromStorage();
}
```

## 并发管理器 (concurrency.ts)
控制并发请求数量，避免同时发起过多请求。

```typescript
// app/lib/concurrency.ts
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

## 指标计算 (metrics.ts)
计算 API 的错误率、可用性、正常运行时间等指标。

```typescript
// app/lib/metrics.ts
export async function calculateMetrics(apiId: string): Promise<Metrics> {
  // 从历史数据计算指标
  return {
    errorRate: 0,
    availability: 100,
    uptime: 100,
    averageLatency: 0,
    maxLatency: 0,
    minLatency: 0
  };
}
```

## 其他核心 Hooks
- **useAuth**: 管理 Firebase 认证状态
- **useAlerts**: 管理告警状态和操作
- **useApiMonitor**: 管理 API 监控逻辑
- **useGeoLocation**: 获取并缓存地理位置信息
- **use-mobile**: 检测移动设备
