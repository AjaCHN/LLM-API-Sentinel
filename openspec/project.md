# LLM API Sentinel 项目规范

## 1. 项目概述

LLM API Sentinel 是一个全球主流大模型 API 实时监控与历史可用性追踪系统，旨在为开发者和企业提供可靠的 API 状态监控服务。

### 1.1 核心功能
- **全球监控**：追踪美国（OpenAI, Anthropic, Google, Meta, Mistral）和中国（Moonshot/Kimi, ZhipuAI, Baichuan, Alibaba/Qwen, Tencent/Hunyuan, Baidu/Ernie, DeepSeek）主流 AI 供应商的连通性与延迟
- **历史数据**：使用交互式面积图可视化性能趋势
- **自适应 UI**：全响应式设计，支持深色/浅色模式切换
- **实时更新**：基于 Firebase Firestore 实现状态即时同步
- **安全访问**：手动健康检查受 Google 身份验证保护
- **智能告警**：自动检测 API 宕机和延迟过高，并生成告警通知
- **数据缓存**：内存和本地存储缓存机制，减少重复请求

### 1.2 技术栈
- **框架**：Next.js 14.2.13 (App Router)
- **服务器**：Express 5.2.1 (用于后台任务)
- **数据库**：Firebase Firestore
- **身份验证**：Firebase Authentication (Google OAuth)
- **样式**：Tailwind CSS 4.1.11
- **图表**：Recharts 3.8.0
- **图标**：Lucide React
- **状态管理**：Zustand 5.0.12

### 1.3 系统架构
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│      Firebase      │◀────│  Express Server │
│   (Client)      │     │  (Auth + Firestore) │     │  (Background)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  External LLM    │
                                                 │  APIs           │
                                                 └─────────────────┘
```

## 2. 代码规范

### 2.1 文件结构
```
├── app/
│   ├── components/
│   │   ├── AlertsDropdown.tsx    # 告警下拉组件
│   │   ├── ApiConfig.tsx         # API 配置组件
│   │   ├── ApiStatusGrid.tsx     # API 状态网格
│   │   ├── DashboardFooter.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── LatencyHistoryChart.tsx
│   │   ├── StatusGrid.tsx
│   │   └── ThemeProvider.tsx
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   ├── useAlerts.ts
│   │   ├── useApiMonitor.ts
│   │   ├── useAuth.ts
│   │   ├── useDashboardData.ts
│   │   └── useGeoLocation.ts
│   ├── lib/
│   │   ├── cache.ts              # 缓存逻辑
│   │   ├── concurrency.ts        # 并发控制
│   │   ├── error.ts              # 错误处理
│   │   ├── firebase.ts           # Firebase 客户端配置
│   │   ├── metrics.ts            # 指标计算
│   │   ├── monitor.ts            # API 监控逻辑
│   │   ├── notification.ts       # 通知处理
│   │   └── utils.ts              # 工具函数
│   ├── store/                    # Zustand 状态管理
│   ├── types/                    # TypeScript 类型定义
│   ├── constants/                # 常量定义
│   ├── globals.css
│   ├── style.css
│   ├── layout.tsx
│   └── page.tsx
├── functions/                    # Firebase Cloud Functions (可选)
├── openspec/                     # 项目规范文档
├── .trae/
│   ├── rules/                    # Trae IDE 规则
│   └── skills/                   # 自定义技能
├── server.ts                     # Express 自定义服务器
├── middleware.ts                 # Next.js 中间件
└── package.json
```

### 2.2 命名约定
- **文件命名**：使用小写字母和连字符，如 `api-status-grid.tsx`
- **组件命名**：使用 PascalCase，如 `ApiStatusGrid`
- **函数命名**：使用 camelCase，如 `performCheck`
- **变量命名**：使用 camelCase，如 `apiStatus`
- **常量命名**：使用 UPPER_SNAKE_CASE，如 `LATENCY_THRESHOLD`
- **类型/接口**：使用 PascalCase，如 `ApiStatus`

### 2.3 代码风格
- **缩进**：使用 2 个空格
- **分号**：使用分号结尾
- **引号**：使用单引号（JSX 中使用双引号）
- **行宽**：≤ 100 字符
- **注释**：
  - 文件头部必须包含单行版本信息（格式：`path/to/file.tsx vX.X.X`）
  - 函数必须有简洁的注释
  - 复杂逻辑必须有内联注释

### 2.4 类型定义
- 使用 TypeScript 类型系统
- 为所有函数参数和返回值添加类型注解
- 为复杂数据结构创建接口定义

### 2.5 版本控制
- 使用 SemVer 2.0.0 版本规范
- 每次发布时更新以下文件：
  - 文件头部版本号
  - HTML Title 标签版本号
  - metadata.json 中的版本信息
  - CHANGELOG.md 中的版本记录

## 3. 开发流程

### 3.1 分支管理
- **main**：主分支，用于生产环境
- **develop**：开发分支，用于集成新功能
- **feature/**：功能分支，用于开发具体功能
- **bugfix/**：修复分支，用于修复 bug

### 3.2 提交规范
- **feat**：添加新功能
- **fix**：修复 bug
- **docs**：更新文档
- **style**：修改样式
- **refactor**：重构代码
- **test**：添加或修改测试
- **chore**：构建或配置更改
- **perf**：性能优化
- **ci**：CI/CD 配置变更
- **revert**：回滚提交

## 4. 组件规范

### 4.1 DashboardHeader
- 显示品牌信息、告警铃铛、主题切换、地理位置、用户登录状态
- 包含签到/签出按钮

### 4.2 ApiStatusGrid
- 以网格形式展示所有 API 状态卡片
- 支持在线/离线/延迟过高三种状态显示
- 使用颜色区分：绿色(在线)、红色(离线)、橙色(延迟过高)

### 4.3 StatusGrid
- 新的状态网格组件，支持供应商分组
- 改进的卡片设计和空状态处理

### 4.4 LatencyHistoryChart
- 使用 Recharts AreaChart 展示历史延迟数据
- 限制显示最近 50 个数据点以优化性能
- 使用 React.memo 减少不必要的重渲染

### 4.5 AlertsDropdown
- 显示活跃告警列表
- 支持告警标记为已解决
- 根据严重程度显示不同颜色

### 4.6 ApiConfig
- 允许用户自定义 API 检查配置
- 配置持久化到本地存储

## 5. API 监控逻辑

### 5.1 监控的 API
- **美国**：OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini 1.5, Meta Llama 3 (Groq), Mistral Large
- **中国**：Moonshot V1 (Kimi), Zhipu GLM-4, Baichuan 2, Qwen Max (Alibaba), Hunyuan (Tencent), Ernie 4.0 (Baidu), DeepSeek V3

### 5.2 监控配置
- `LATENCY_THRESHOLD`: 1500ms
- `MAX_RETRIES`: 2
- `RETRY_DELAY`: 1000ms
- `MAX_CONCURRENT`: 5
- `CHECK_INTERVAL`: 5 分钟
- `CACHE_EXPIRY`: 30 秒
- `GEO_INFO_EXPIRY`: 24 小时

### 5.3 后台监控
- Express 服务器每 5 分钟执行一次后台检查
- 初始检查在服务器启动 10 秒后执行
- 检查结果批量写入 Firestore
- 使用并发管理器控制请求数量

## 6. 数据模型

### 6.1 Firestore 集合
- `/api_status/{apiId}`: API 当前状态
- `/status_history/{historyId}`: 历史性能数据
- `/alerts/{alertId}`: 系统告警

### 6.2 数据结构
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
  errorRate?: number;
  availability?: number;
  uptime?: number;
  averageLatency?: number;
  maxLatency?: number;
  minLatency?: number;
}

interface Alert {
  id: string;
  apiId: string;
  apiName: string;
  type: 'downtime' | 'latency';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: any;
  resolved: boolean;
}
```

## 7. 安全措施

### 7.1 认证
- 使用 Firebase Authentication (Google OAuth)
- 敏感操作需要用户登录

### 7.2 Firestore 规则
- `api_status`: 所有人可读，仅管理员可写
- `status_history`: 所有人可读，仅管理员可写
- `alerts`: 所有人可读，仅管理员可写
- 管理员定义：users 集合中 role 为 admin 的用户，或特定邮箱验证用户

## 8. 性能优化

### 8.1 前端
- 使用 React.memo 优化组件渲染
- 使用 useMemo 缓存计算结果
- 限制图表数据点数量（最近 50 个）
- 地理位置信息本地缓存 24 小时
- API 检查结果缓存（内存 + localStorage）

### 8.2 后端
- 并发请求限制 (MAX_CONCURRENT = 5)
- API 检查重试机制（指数退避）
- 批量写入 Firestore
- 缓存策略优化

## 9. 测试策略

### 9.1 测试类型
- **单元测试**：测试单个函数和组件
- **集成测试**：测试组件之间的交互

### 9.2 测试覆盖
- 目标覆盖率：≥80%
- 重点测试监控逻辑和数据处理

### 9.3 测试工具
- **Jest**：用于单元测试
- **React Testing Library**：用于组件测试

## 10. 部署

### 10.1 环境配置
- Firebase 项目配置存储在 `firebase-applet-config.json`
- Firestore 数据库 ID 在配置文件中指定

### 10.2 启动
- 开发：`npm run dev` (启动 Next.js + Express)
- 生产：`npm run build && npm start`
- 测试：`npm run test`
- 代码检查：`npm run lint`
