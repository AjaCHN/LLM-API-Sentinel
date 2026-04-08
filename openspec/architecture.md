# 架构概览

LLM API Sentinel 采用 Next.js 14 (App Router) 构建，结合自定义 Express 服务器进行后台监控。

## 技术栈
- **框架**: Next.js 14
- **服务器**: Express (用于后台任务)
- **数据库**: Firebase Firestore
- **身份验证**: Firebase Authentication
- **样式**: Tailwind CSS 4
- **图表**: Recharts

## 系统架构图
```mermaid
graph TD
    Client[客户端 (Next.js)] -->|Auth| FirebaseAuth[Firebase Auth]
    Client -->|Read/Write| Firestore[Firestore]
    Server[Express 后台任务] -->|Monitor| ExternalAPIs[外部 LLM API]
    Server -->|Update| Firestore
```
