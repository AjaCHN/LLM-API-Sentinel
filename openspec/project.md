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
- **地理位置**：实时检测监控节点位置，24小时本地缓存
- **多语言支持**：16 种语言国际化，自动检测浏览器语言

### 1.2 技术栈
| 类别 | 技术 | 版本 |
|-----|------|------|
| 前端框架 | Next.js 14.2.13 (App Router) | 14.2.13 |
| 后端服务器 | Express 5.2.1 | 5.2.1 |
| 数据库 | Firebase Firestore | - |
| 身份验证 | Firebase Authentication (Google OAuth) | - |
| 样式 | Tailwind CSS 4.1.11 | 4.1.11 |
| 图表 | Recharts 3.8.0 | 3.8.0 |
| 图标 | Lucide React | - |
| 状态管理 | Zustand 5.0.12 | 5.0.12 |
| 国际化 | 自定义 i18n 系统 | - |
| 时间处理 | date-fns 4.1.0 | 4.1.0 |

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
│   │   ├── ApiStatusGrid.tsx     # API 状态网格（旧版）
│   │   ├── DashboardFooter.tsx   # 页脚组件
│   │   ├── DashboardHeader.tsx   # 头部组件
│   │   ├── LatencyHistoryChart.tsx # 延迟历史图表
│   │   ├── StatusGrid.tsx        # 状态网格组件（新版）
│   │   └── ThemeProvider.tsx     # 主题提供者
│   ├── hooks/
│   │   ├── use-mobile.ts         # 移动端检测
│   │   ├── useAlerts.ts          # 告警管理
│   │   ├── useApiMonitor.ts      # API 监控
│   │   ├── useAuth.ts            # 认证管理
│   │   ├── useDashboardData.ts   # 仪表盘数据
│   │   ├── useGeoLocation.ts     # 地理位置
│   │   └── useI18n.ts            # 国际化
│   ├── lib/
│   │   ├── cache.ts              # 缓存逻辑
│   │   ├── concurrency.ts        # 并发控制
│   │   ├── error-handler.ts      # 错误处理
│   │   ├── error.tsx             # 错误边界和通知组件
│   │   ├── firebase.ts           # Firebase 客户端配置
│   │   ├── i18n.ts               # 国际化系统
│   │   ├── metrics.ts            # 指标计算
│   │   ├── monitor.ts            # API 监控逻辑
│   │   ├── notification.ts       # 通知处理
│   │   └── utils.ts              # 工具函数
│   ├── store/                    # Zustand 状态管理
│   │   ├── alerts.ts             # 告警状态
│   │   ├── api.ts                # API 状态
│   │   ├── auth.ts               # 认证状态
│   │   ├── error.ts              # 错误状态
│   │   ├── geo.ts                # 地理位置状态
│   │   ├── index.ts              # 导出文件
│   │   └── store.ts              # 根 store
│   ├── types/                    # TypeScript 类型定义
│   │   └── index.ts
│   ├── constants/                # 常量定义
│   │   └── index.ts
│   ├── locales/                  # 国际化翻译文件
│   │   ├── en.json               # 英文
│   │   ├── zh-cn.json            # 简体中文
│   │   ├── zh-tw.json            # 繁体中文
│   │   ├── ar.json               # 阿拉伯语
│   │   ├── cs.json               # 捷克语
│   │   ├── es.json               # 西班牙语
│   │   ├── hi.json               # 印地语
│   │   ├── id.json               # 印度尼西亚语
│   │   ├── it.json               # 意大利语
│   │   ├── nl.json               # 荷兰语
│   │   ├── pl.json               # 波兰语
│   │   ├── sv.json               # 瑞典语
│   │   ├── th.json               # 泰语
│   │   ├── tr.json               # 土耳其语
│   │   ├── ru.json               # 俄语
│   │   └── vi.json               # 越南语
│   ├── style.css                 # 主题样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 主页面
├── openspec/                     # 项目规范文档
├── server.ts                     # Express 自定义服务器（含后台监控）
└── package.json
```

### 2.2 命名约定
| 类型 | 约定 | 示例 |
|-----|------|------|
| 文件命名 | 小写字母 + 连字符 | `api-status-grid.tsx` |
| 组件 | PascalCase | `ApiStatusGrid` |
| 函数 | camelCase | `performCheck` |
| 变量 | camelCase | `apiStatus` |
| 常量 | UPPER_SNAKE_CASE | `LATENCY_THRESHOLD` |
| 类型/接口 | PascalCase | `ApiStatus` |
| 翻译 Key | 小写 + 点分隔 | `dashboard.title` |

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
- 禁止使用 `any` 类型

### 2.5 版本控制
- 使用 SemVer 2.0.0 版本规范
- 版本号格式：`主版本.次版本.修订号`（如 `2.6.1`）
- 每次发布时更新以下文件：
  1. 文件头部版本号（所有代码文件）
  2. HTML Title 标签版本号（`app/layout.tsx`）
  3. `package.json` 中的版本信息
  4. `CHANGELOG.md` 中的版本记录

## 3. API 接口文档

### 3.1 客户端 API

#### 3.1.1 useDashboardData Hook
**功能**：统一获取仪表盘所需的所有数据

**返回值**：
```typescript
{
  statuses: ApiStatus[];      // API 状态列表
  history: StatusHistory[];   // 历史数据
  alerts: Alert[];            // 告警列表
  user: User | null;          // 当前用户
  isChecking: boolean;        // 是否正在检查
  lastUpdate: Date | null;    // 最后更新时间
  geo: GeoLocation | null;    // 地理位置信息
  runCheck: () => void;       // 执行检查
  resolveAlert: (id: string) => Promise<void>;  // 解决告警
  login: () => Promise<void>; // 登录
  logout: () => Promise<void>; // 登出
}
```

#### 3.1.2 useApiMonitor Hook
**功能**：管理 API 监控逻辑

**返回值**：
```typescript
{
  statuses: ApiStatus[];    // API 状态列表
  history: StatusHistory[]; // 历史数据
  isChecking: boolean;      // 是否正在检查
  runCheck: () => void;     // 执行检查
}
```

#### 3.1.3 performCheck 函数
**功能**：执行批量 API 检查

**参数**：无

**返回值**：`Promise<ApiCheckResult[]>` - API 检查结果数组

#### 3.1.4 getCache 函数
**功能**：获取缓存的 API 检查结果

**参数**：
- `apiId: string` - API 标识

**返回值**：`ApiCheckResult | null`

#### 3.1.5 setCache 函数
**功能**：设置 API 检查结果缓存

**参数**：
- `apiId: string` - API 标识
- `result: ApiCheckResult` - 检查结果

**返回值**：`void`

### 3.2 后台监控 API

#### 3.2.1 runBackgroundMonitor 函数
**功能**：执行后台监控任务

**参数**：无

**返回值**：`Promise<void>`

#### 3.2.2 sendAlert 函数
**功能**：发送告警通知

**参数**：
- `alert: Alert` - 告警信息

**返回值**：`Promise<void>`

## 4. 开发流程

### 4.1 分支管理
| 分支 | 用途 |
|-----|------|
| **main** | 主分支，用于生产环境 |
| **develop** | 开发分支，用于集成新功能 |
| **feature/** | 功能分支，用于开发具体功能 |
| **bugfix/** | 修复分支，用于修复 bug |

### 4.2 提交规范
| 类型 | 描述 |
|-----|------|
| **feat** | 添加新功能 |
| **fix** | 修复 bug |
| **docs** | 更新文档 |
| **style** | 修改样式 |
| **refactor** | 重构代码 |
| **test** | 添加或修改测试 |
| **chore** | 构建或配置更改 |
| **perf** | 性能优化 |
| **ci** | CI/CD 配置变更 |
| **revert** | 回滚提交 |

**提交格式**：
```
<type>: <description>

[可选正文]

[可选页脚]
```

**示例**：
```
feat: 添加 API 配置功能

- 支持添加/删除自定义 API 端点
- 配置持久化到 localStorage
- 支持重置为默认配置
```

## 5. 组件规范

### 5.1 DashboardHeader
**功能**：显示品牌信息、告警铃铛、主题切换、地理位置、用户登录状态

**Props**：
```typescript
interface DashboardHeaderProps {
  user: User | null;
  alerts: Alert[];
  showAlerts: boolean;
  setShowAlerts: (show: boolean) => void;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  geo: GeoLocation | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
}
```

### 5.2 StatusGrid
**功能**：以网格形式展示所有 API 状态卡片，支持供应商分组

**Props**：
```typescript
interface StatusGridProps {
  statuses: ApiStatus[];
}
```

### 5.3 ApiStatusGrid
**功能**：旧版状态网格组件，保留用于兼容性

**Props**：
```typescript
interface ApiStatusGridProps {
  statuses: ApiStatus[];
}
```

### 5.4 LatencyHistoryChart
**功能**：使用 Recharts AreaChart 展示历史延迟数据

**Props**：
```typescript
interface LatencyHistoryChartProps {
  chartData: ChartDataPoint[];
  statuses: ApiStatus[];
  getApiColor: (id: string) => string;
}
```

### 5.5 AlertsDropdown
**功能**：显示活跃告警列表，支持告警解决

**Props**：
```typescript
interface AlertsDropdownProps {
  alerts: Alert[];
  show: boolean;
  onClose: () => void;
  resolveAlert: (id: string) => void;
}
```

### 5.6 ApiConfig
**功能**：允许用户自定义 API 检查配置

**Props**：无

### 5.7 ThemeProvider
**功能**：管理深色/浅色主题切换

**Props**：继承 `NextThemesProvider` 的所有 props

## 6. API 监控逻辑

### 6.1 监控的 API
| 区域 | API | Provider | URL |
|-----|-----|----------|-----|
| 美国 | GPT-4o | OpenAI | https://api.openai.com/v1/models |
| 美国 | Claude 3.5 | Anthropic | https://api.anthropic.com/v1/messages |
| 美国 | Gemini 1.5 | Google | https://generativelanguage.googleapis.com/v1beta/models |
| 美国 | Llama 3 | Meta (Groq) | https://api.groq.com/openai/v1/models |
| 美国 | Mistral Large | Mistral | https://api.mistral.ai/v1/models |
| 中国 | Kimi | Moonshot | https://api.moonshot.cn/v1/models |
| 中国 | GLM-4 | ZhipuAI | https://open.bigmodel.cn/api/paas/v4/model_list |
| 中国 | Baichuan 2 | Baichuan | https://api.baichuan-ai.com/v1/models |
| 中国 | Qwen Max | Alibaba | https://dashscope.aliyuncs.com/api/v1/models |
| 中国 | Hunyuan | Tencent | https://hunyuan.tencentcloudapi.com |
| 中国 | Ernie 4.0 | Baidu | https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions |
| 中国 | DeepSeek V3 | DeepSeek | https://api.deepseek.com/models |

### 6.2 监控配置
| 常量 | 值 | 说明 |
|-----|---|------|
| `LATENCY_THRESHOLD` | 1500ms | 延迟阈值，超过此值触发告警 |
| `DEGRADED_THRESHOLD` | 1000ms | 降级阈值，超过此值标记为降级 |
| `MAX_RETRIES` | 2 | 最大重试次数 |
| `RETRY_DELAY` | 1000ms | 重试间隔 |
| `MAX_CONCURRENT` | 5 | 最大并发请求数 |
| `CHECK_INTERVAL` | 5 分钟 | 后台检查间隔 |
| `CACHE_EXPIRY` | 30 秒 | 默认缓存过期时间 |
| `GEO_INFO_EXPIRY` | 24 小时 | 地理位置缓存过期时间 |

### 6.3 后台监控流程
1. Express 服务器启动后 10 秒执行首次检查
2. 每 5 分钟自动执行一次后台检查
3. 使用并发管理器控制请求数量（最大 5 个并发）
4. 检查结果批量写入 Firestore
5. 根据状态生成智能告警

## 7. 数据模型

### 7.1 Firestore 集合
| 集合路径 | 用途 | 权限 |
|---------|------|------|
| `/api_status/{apiId}` | API 当前状态 | 所有人可读，仅管理员可写 |
| `/status_history/{historyId}` | 历史性能数据 | 所有人可读，仅管理员可写 |
| `/alerts/{alertId}` | 系统告警 | 所有人可读，仅管理员可写 |

### 7.2 数据结构

#### ApiStatus
```typescript
interface ApiStatus {
  id: string;                    // API 唯一标识
  name: string;                  // 显示名称
  provider: string;              // 提供商名称
  url: string;                   // 检查 URL
  status: 'online' | 'offline' | 'degraded';  // 状态
  latency: number;               // 延迟(ms)
  lastChecked: string;           // 最后检查时间
  error?: string;                // 错误信息
  retries?: number;              // 重试次数
  errorRate?: number;            // 错误率(%)
  availability?: number;         // 可用性(%)
  uptime?: number;               // 正常运行时间(%)
  averageLatency?: number;       // 平均延迟(ms)
  maxLatency?: number;           // 最大延迟(ms)
  minLatency?: number;           // 最小延迟(ms)
}
```

#### StatusHistory
```typescript
interface StatusHistory {
  id?: string;                   // 记录 ID
  apiId: string;                 // API 标识
  status: 'online' | 'offline' | 'degraded';  // 状态
  latency: number;               // 延迟(ms)
  timestamp: Date;               // 时间戳
  time: string;                  // 格式化时间
}
```

#### Alert
```typescript
interface Alert {
  id: string;                    // 告警 ID
  apiId: string;                 // API 标识
  apiName: string;               // API 名称
  type: 'downtime' | 'latency' | 'error';  // 告警类型
  severity: 'low' | 'medium' | 'high' | 'critical';  // 严重程度
  message: string;               // 告警消息
  timestamp: Date | unknown;     // 时间戳
  resolved: boolean;             // 是否已解决
  error?: string;                // 错误信息
  retries?: number;              // 重试次数
  latency?: number;              // 延迟值
  resolvedAt?: Date;             // 解决时间
  resolvedBy?: string;           // 解决人
}
```

## 8. 错误处理规范

### 8.1 错误分类
| 错误类型 | 代码 | 描述 |
|---------|------|------|
| 网络错误 | `NETWORK_TIMEOUT` | 网络请求超时 |
| 网络错误 | `NETWORK_OFFLINE` | 用户离线 |
| 网络错误 | `NETWORK_ERROR` | 网络连接错误 |
| API 错误 | `API_UNAVAILABLE` | API 服务不可用 |
| API 错误 | `API_ERROR` | API 请求失败 |
| API 错误 | `API_RATE_LIMITED` | API 请求被限流 |
| 认证错误 | `AUTH_REQUIRED` | 需要登录 |
| 认证错误 | `AUTH_FAILED` | 登录失败 |
| 认证错误 | `AUTH_EXPIRED` | 会话过期 |
| Firebase 错误 | `FIREBASE_ERROR` | Firebase 服务错误 |
| Firebase 错误 | `FIRESTORE_ERROR` | 数据库操作失败 |
| 验证错误 | `VALIDATION_ERROR` | 输入验证失败 |
| 未知错误 | `UNKNOWN_ERROR` | 未知错误 |

### 8.2 错误处理流程
1. **捕获错误**：使用 try-catch 捕获异步操作错误
2. **分类处理**：使用 `handleError` 函数将错误分类
3. **记录日志**：使用 `logError` 函数记录错误日志
4. **显示通知**：将错误信息展示给用户
5. **优雅降级**：提供备用方案或默认数据

### 8.3 错误边界
- 使用 `ErrorBoundary` 组件捕获 React 组件错误
- 在布局层面实现全局错误处理
- 提供用户友好的错误提示和刷新按钮

## 9. 日志规范

### 9.1 日志级别
| 级别 | 用途 | 示例 |
|-----|------|------|
| **DEBUG** | 调试信息（仅开发环境） | 变量值、函数调用 |
| **INFO** | 一般信息 | 服务启动、配置加载 |
| **WARN** | 警告信息 | 缓存过期、降级处理 |
| **ERROR** | 错误信息 | API 调用失败、数据异常 |
| **CRITICAL** | 严重错误 | 服务崩溃、认证失败 |

### 9.2 日志格式
```
[时间] [级别] [模块] 消息
```

**示例**：
```
2024-01-15 10:30:00 [INFO] [Monitor] Starting background check...
2024-01-15 10:30:05 [ERROR] [Monitor] API check failed for openai-gpt-4o
2024-01-15 10:30:05 [WARN] [Cache] Cache expired for anthropic-claude-3-5
```

### 9.3 日志实践
- 开发环境：输出所有级别的日志
- 生产环境：仅输出 WARN、ERROR、CRITICAL 级别日志
- 敏感信息：禁止记录密码、Token 等敏感数据
- 错误追踪：记录错误堆栈信息以便排查

## 10. 安全措施

### 10.1 认证
- 使用 Firebase Authentication (Google OAuth)
- 敏感操作（如手动检查）需要用户登录
- 会话管理由 Firebase 自动处理

### 10.2 Firestore 规则
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
        (request.auth.token.email == "admin@example.com" && 
         request.auth.token.email_verified == true);
    }

    match /api_status/{apiId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /status_history/{historyId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /alerts/{alertId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

### 10.3 安全最佳实践
- 代码/日志中不存储密钥
- 输入验证防止 XSS 攻击
- 使用 HTTPS 进行通信
- 最小权限原则配置 Firestore 规则

## 11. 性能优化

### 11.1 前端优化
| 优化项 | 实现方式 |
|-------|---------|
| 组件渲染 | 使用 React.memo 减少不必要重渲染 |
| 计算缓存 | 使用 useMemo 缓存计算结果 |
| 图表性能 | 限制数据点数量（最近 50 个） |
| 地理位置 | 本地缓存 24 小时 |
| API 缓存 | 内存 + localStorage 双层缓存 |

### 11.2 后端优化
| 优化项 | 实现方式 |
|-------|---------|
| 并发控制 | 限制最大并发请求数（5 个） |
| 重试机制 | 指数退避重试策略 |
| 批量写入 | 批量更新 Firestore |
| 缓存策略 | 智能过期时间计算 |

## 12. CI/CD 流程

### 12.1 持续集成
```
代码提交 → GitHub Actions → 安装依赖 → 代码检查 → 类型检查 → 运行测试 → 构建
```

### 12.2 检查步骤
| 步骤 | 命令 | 用途 |
|-----|------|------|
| 安装依赖 | `npm install` | 安装项目依赖 |
| ESLint | `npm run lint` | 代码风格检查 |
| TypeScript | `npx tsc --noEmit` | 类型检查 |
| 测试 | `npm test` | 运行单元测试 |
| 构建 | `npm run build` | 构建生产版本 |

### 12.3 部署流程
```
main 分支更新 → GitHub Actions → 构建 → Firebase 部署
```

### 12.4 部署命令
| 命令 | 用途 |
|-----|------|
| `npm run build` | 构建前端 |
| `npm run build:functions` | 构建 Cloud Functions |
| `npm run deploy:functions` | 部署 Cloud Functions |

## 13. 测试策略

### 13.1 测试类型
| 类型 | 描述 | 工具 |
|-----|------|------|
| 单元测试 | 测试单个函数和组件 | Jest |
| 组件测试 | 测试组件交互 | React Testing Library |

### 13.2 测试覆盖
- 目标覆盖率：≥80%
- 重点测试：监控逻辑、数据处理、错误处理

### 13.3 测试文件命名
- 单元测试：`*.test.ts`
- 组件测试：`*.test.tsx`

## 15. 国际化 (i18n)

### 15.1 支持的语言
| 语言代码 | 语言名称 | 本地名称 |
|---------|---------|--------|
| en | English | English |
| zh-cn | 简体中文 | 简体中文 |
| zh-tw | 繁体中文 | 繁體中文 |
| ar | 阿拉伯语 | العربية |
| cs | 捷克语 | Čeština |
| es | 西班牙语 | Español |
| hi | 印地语 | हिन्दी |
| id | 印度尼西亚语 | Bahasa Indonesia |
| it | 意大利语 | Italiano |
| nl | 荷兰语 | Nederlands |
| pl | 波兰语 | Polski |
| sv | 瑞典语 | Svenska |
| th | 泰语 | ไทย |
| tr | 土耳其语 | Türkçe |
| ru | 俄语 | Русский |
| vi | 越南语 | Tiếng Việt |

### 15.2 语言检测与切换
- **自动检测**：系统自动检测浏览器语言设置
- **持久化**：用户语言选择保存到 localStorage
- **回退机制**：未找到语言时回退到英文
- **翻译格式**：使用点分隔的翻译键（如 `dashboard.title`）

### 15.3 翻译文件格式
```json
{
  "errors": {
    "networkTimeout": "超时信息"
  },
  "dashboard": {
    "title": "标题"
  }
}
```

### 15.4 API 使用方式
```typescript
import { t, setLocale, getLocale, initLocale } from '@/lib/i18n';

// 获取翻译
const title = t('dashboard.title');

// 设置语言
setLocale('es');

// 初始化（自动检测）
initLocale();
```

## 16. 部署

### 16.1 环境配置
- Firebase 项目配置：`firebase-applet-config.json`
- Firestore 数据库 ID：在配置文件中指定

### 16.2 启动命令
| 命令 | 用途 |
|-----|------|
| `npm run dev` | 开发模式 |
| `npm run build` | 构建生产版本 |
| `npm start` | 启动生产服务器 |
| `npm test` | 运行测试 |
| `npm run lint` | 代码检查 |