# 逻辑与服务 (v4.0.5)

## 客户端 Hooks

### `useDashboardData`
负责聚合仪表盘所需的核心数据。
```typescript
export function useDashboardData() {
  // 内部调用 useAuth, useTasks, 以及 firestoreUtils
  // 返回 statuses, history, alerts, user 等状态
}
```

### `useAuth`
管理 Firebase 身份验证状态及用户信息。

### `useTasks`
管理用户的任务列表，提供增删改查及实时同步功能。

## 后台监控任务 (server.ts)
自定义 Express 服务器，负责执行长期运行的后台任务。

- **定时任务**: 每 5 分钟自动执行一次 API 可用性检测。
- **多区域检测**: 模拟北美 (NA)、欧洲 (EU) 和亚洲 (Asia) 节点的检测逻辑。
- **执行流程**:
  1. 遍历所有配置的 API 节点。
  2. 根据策略（Ping 或完整请求）发起探测。
  3. 计算延迟、吞吐量和可用性。
  4. 批量将结果写入 Firestore (`api_status` 和 `status_history`)。
  5. 触发告警逻辑，若可用性低于阈值则发送邮件通知。

## 错误处理
- **Firestore 权限错误**: 统一由 `handleFirestoreError` 捕获并抛出结构化 JSON 错误。
- **全局 ErrorBoundary**: 捕获 React 渲染树中的未处理异常，提供友好的重试界面。
