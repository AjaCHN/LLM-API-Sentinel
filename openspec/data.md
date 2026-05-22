# 数据模型与安全

## 数据模型 (Firestore)

本项目使用 Firebase Firestore 存储监控数据。

### 实体定义
- **ApiStatus**: API 的当前状态，包含基本信息、状态、延迟、指标等。
- **StatusHistory**: API 的历史性能数据，用于生成图表。
- **Alert**: 系统告警信息，包含告警类型、严重程度、解决状态等。

### 集合路径
- `/api_status/{apiId}`: API 当前状态。
- `/status_history/{historyId}`: 历史性能数据。
- `/alerts/{alertId}`: 系统告警。

### 数据结构

#### ApiStatus
```typescript
interface ApiStatus {
  id: string;
  name: string;
  provider: string;
  url: string;
  status: 'online' | 'offline';
  latency: number;
  lastChecked: string;
  error?: string;
  retries?: number;
  // 增强指标
  errorRate?: number;
  availability?: number;
  uptime?: number;
  averageLatency?: number;
  maxLatency?: number;
  minLatency?: number;
}
```

#### StatusHistory
```typescript
interface StatusHistory {
  id: string;
  apiId: string;
  status: 'online' | 'offline';
  latency: number;
  timestamp: any; // Firestore Timestamp
}
```

#### Alert
```typescript
interface Alert {
  id: string;
  apiId: string;
  apiName: string;
  type: 'downtime' | 'latency';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: any; // Firestore Timestamp
  resolved: boolean;
}
```

## 安全规则 (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 辅助函数：检查是否已认证
    function isAuthenticated() {
      return request.auth != null;
    }

    // 辅助函数：检查是否为管理员
    function isAdmin() {
      return isAuthenticated() &&
        (request.auth.token.email == "ajalam2015@gmail.com" && 
         request.auth.token.email_verified == true);
    }

    // API Status 集合
    match /api_status/{apiId} {
      allow read: if true; // 所有人可读
      allow write: if isAdmin(); // 仅管理员可写
    }

    // Status History 集合
    match /status_history/{historyId} {
      allow read: if true; // 所有人可读
      allow write: if isAdmin(); // 仅管理员可写
    }

    // Alerts 集合
    match /alerts/{alertId} {
      allow read: if true; // 所有人可读
      allow write: if isAdmin(); // 仅管理员可写
    }
  }
}
```
