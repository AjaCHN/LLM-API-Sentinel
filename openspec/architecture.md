# 架构概览 (v4.0.5)

LLM API Sentinel 采用 Next.js 15 (App Router) 构建，结合自定义 Express 服务器进行 24/7 自主后台监控。

## 技术栈
- **前端框架**: Next.js 15 (App Router)
- **后端服务器**: Express (用于长期运行的后台监控任务)
- **数据库**: Firebase Firestore (实时数据同步与持久化)
- **身份验证**: Firebase Authentication (Google 登录)
- **样式**: Tailwind CSS 4
- **图表**: Recharts
- **图标**: Lucide React
- **国际化**: next-intl (localePrefix: 'always')
- **告警通知**: Nodemailer, Axios

## 模块隔离 (Module Isolation)
项目在 v4.0.3 之后实施了严格的客户端与服务器端模块隔离，以解决 `fs` 模块在客户端无法解析的问题：
- **Client-Side**: `app/lib/firestoreUtils.ts`, `app/lib/metrics.ts` (仅包含 Firebase 客户端 SDK 逻辑)
- **Server-Side**: `app/lib/firestore-server.ts`, `app/lib/metrics-server.ts` (包含 `firebase-admin` 逻辑，仅在 `server.ts` 或 API Routes 中使用)

## 系统架构图
```mermaid
graph TD
    Client[客户端 (Next.js)] -->|Auth| FirebaseAuth[Firebase Auth]
    Client -->|Read/Write| Firestore[Firestore]
    Server[Express 后台任务] -->|Monitor| ExternalAPIs[外部 LLM API]
    Server -->|Update| Firestore
    Server -->|Alert| Email[邮件通知]
    Server -->|Metrics| Firestore
```
