# 架构概览

LLM API Sentinel 采用 Next.js 14.2.13 (App Router) 构建，结合自定义 Express 5.2.1 服务器进行后台监控。

## 技术栈
- **框架**: Next.js 14.2.13 (App Router)
- **服务器**: Express 5.2.1 (用于后台任务)
- **数据库**: Firebase Firestore
- **身份验证**: Firebase Authentication (Google OAuth)
- **样式**: Tailwind CSS 4.1.11
- **图表**: Recharts 3.8.0
- **图标**: Lucide React
- **国际化**: next-intl 4.8.3
- **时间处理**: date-fns 4.1.0

## 系统架构图
```mermaid
graph TD
    Client[客户端 (Next.js)] -->|Auth| FirebaseAuth[Firebase Auth]
    Client -->|Read| Firestore[Firestore]
    Client -->|Write| Firestore
    Server[Express 后台任务] -->|Monitor| ExternalAPIs[外部 LLM API]
    Server -->|Batch Update| Firestore
    ExternalAPIs -->|Response| Server
    Firestore -->|Real-time Sync| Client
```

## 前端架构
- **组件结构**:
  - DashboardHeader: 品牌信息、用户认证、告警通知、主题切换
  - ApiStatusGrid: API 状态卡片网格，显示在线/离线/延迟状态
  - LatencyHistoryChart: 历史延迟趋势图表，使用 Recharts
  - AlertsDropdown: 活跃告警下拉菜单，支持告警解决
  - ThemeProvider: 深色/浅色主题管理

- **数据管理**:
  - useDashboardData: 核心数据钩子，处理状态获取、历史数据、告警管理
  - Firebase Firestore 实时监听
  - 地理位置信息本地缓存 (24小时)

## 后端架构
- **Express 服务器**:
  - 每5分钟执行一次后台监控任务
  - 初始检查在服务器启动10秒后执行
  - 并发请求限制 (MAX_CONCURRENT = 5)
  - API 检查重试机制 (MAX_RETRIES = 2, RETRY_DELAY = 1000ms)

- **监控逻辑**:
  - 检查美国和中国的主流 LLM API
  - 批量写入 Firestore 以优化性能
  - 智能告警规则，避免重复告警
  - 基于延迟值的动态告警严重程度评估

## 数据流
1. 客户端通过 Firebase Auth 进行用户认证
2. 认证用户可以手动触发 API 检查
3. 后台任务每5分钟自动执行 API 检查
4. 检查结果批量写入 Firestore
5. 客户端通过实时监听获取最新状态
6. 系统根据检查结果生成智能告警
7. 认证用户可以查看和解决告警
