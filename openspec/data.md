# 数据模型与安全

## 数据模型 (Firestore)

本项目使用 Firebase Firestore 存储监控数据和用户配置。

### 核心集合 (Collections)
- **`api_status`**: 存储各个 API 的当前最新状态（延迟、可用性、最后检查时间等）。
- **`status_history`**: 存储 API 的历史性能数据，用于图表展示。
- **`alerts`**: 存储系统生成的告警信息。
- **`user_preferences`**: 存储用户的个性化设置（告警阈值、刷新频率、通知偏好等）。
- **`tasks`**: 存储用户的任务状态（todo, inProgress, done）。

## 安全规则 (firestore.rules)

采用严格的基于角色的访问控制 (RBAC) 和数据校验。

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 检查是否为管理员
    function isAdmin() {
      return request.auth != null &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
          (request.auth.token.email == "ajalam2015@gmail.com" && request.auth.token.email_verified == true));
    }

    // 检查是否为文档所有者
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // API 状态与历史记录：所有人可读，仅管理员可写
    match /api_status/{apiId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /status_history/{historyId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 告警信息：所有人可读，仅管理员可写
    match /alerts/{alertId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 用户偏好设置：仅所有者可读写
    match /user_preferences/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // 任务管理：仅所有者可读写
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```
