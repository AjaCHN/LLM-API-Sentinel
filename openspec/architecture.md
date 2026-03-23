# 架构概览

LLM API Sentinel 采用 Next.js 15 (App Router) 构建，结合自定义 Express 服务器进行后台监控。

## 技术栈
- **前端框架**: Next.js 15 (App Router)
- **后端服务器**: Express (用于长期运行的后台监控任务)
- **数据库**: Firebase Firestore (实时数据同步与持久化)
- **身份验证**: Firebase Authentication (Google 登录)
- **样式**: Tailwind CSS 4
- **图表**: Recharts
- **图标**: Lucide React
- **国际化**: next-intl
- **告警通知**: Nodemailer, Axios

## 系统架构图
```mermaid
graph TD
    Client[客户端 (Next.js)] -->|Auth| FirebaseAuth[Firebase Auth]
    Client -->|Read/Write| Firestore[Firestore]
    Server[Express 后台任务] -->|Monitor| ExternalAPIs[外部 LLM API]
    Server -->|Update| Firestore
    Server -->|Alert| Email[邮件通知]
```
