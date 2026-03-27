# 数据模型与安全

## 数据模型 (Firestore)

本项目使用 Firebase Firestore 存储监控数据。

### 实体定义
- **ApiStatus**: API 的当前状态。
- **StatusHistory**: API 的历史性能数据。
- **Alert**: 系统告警信息。

### 集合路径
- `/api_status/{apiId}`: API 当前状态。
- `/status_history/{historyId}`: 历史性能数据。
- `/alerts/{alertId}`: 系统告警。

## 安全规则 (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 辅助函数...
    function isAdmin() {
      return request.auth != null &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
          (request.auth.token.email == "ajalam2015@gmail.com" && request.auth.token.email_verified == true));
    }

    match /api_status/{apiId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    // ... 其他匹配规则
  }
}
```
