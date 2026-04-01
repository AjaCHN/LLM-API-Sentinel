# 逻辑与服务

## useDashboardData (Dashboard Hook)
负责获取实时监控数据、处理告警逻辑及用户登录状态。

```typescript
// app/hooks/useDashboardData.ts
export function useDashboardData() {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  // ...
  return { statuses, history, alerts, user, ... };
}
```

## 后台监控任务 (server.ts)
每 5 分钟执行一次 API 可用性检测，包括：
- 检查 API 连通性
- 测量响应延迟
- 批量写入 Firestore
- 处理告警逻辑

```typescript
// server.ts
async function runBackgroundMonitor() {
  // 1. 获取 API 状态
  // 2. 批量写入 Firestore
  // 3. 处理告警
}
```

## 告警系统
- **触发条件**：API 宕机或延迟 >1500ms
- **告警级别**：low, medium, high
- **告警管理**：认证用户可以解决活跃告警
- **通知方式**：通知铃和全局告警横幅
