# 逻辑与服务

## useDashboardData (Dashboard Hook)
负责获取实时监控数据、处理告警逻辑及用户登录状态。

```typescript
// app/hooks/useDashboardData.ts
export function useDashboardData() {
  const [statuses, setStatuses] = useState<any[]>([]);
  // ...
  return { statuses, history, alerts, user, ... };
}
```

## 后台监控任务 (server.ts)
每 5 分钟执行一次 API 可用性检测。

```typescript
// server.ts
async function runBackgroundMonitor() {
  // 1. 获取 API 状态
  // 2. 批量写入 Firestore
  // 3. 处理告警
}
```
