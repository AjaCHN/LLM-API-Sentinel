# LLM API Sentinel 部署指南

## 架构概述

本项目采用**静态前端 + Firebase 后端**的架构设计：

- **前端**：Next.js 14 静态导出（输出到 `out` 目录）
- **实时数据**：Firebase Firestore 实时监听
- **后端监控**：Firebase Cloud Functions（定时任务）

### 数据流

1. **Firebase Cloud Functions** (`scheduledMonitor`) 每 5 分钟自动检查所有 LLM API 的状态
2. 检查结果存储到 **Firestore** 的 `api_status` 和 `status_history` 集合
3. **前端**通过 Firestore 实时监听获取最新状态，无需 API 调用

### 优势

- ✅ **跨平台兼容**：静态前端可部署到任何静态托管服务
- ✅ **实时更新**：Firestore 实时监听，无轮询延迟
- ✅ **无服务器依赖**：无需管理 API 服务器
- ✅ **成本优化**：静态托管费用极低

---

## 部署到腾讯云 EdgeOne Pages

### 前提条件

1. EdgeOne Pages 项目已创建
2. 已安装 Node.js 20+ 和 pnpm

### 部署步骤

#### 1. 本地构建

```bash
# 安装依赖
pnpm install

# 构建静态站点
pnpm build
```

构建产物在 `out` 目录。

#### 2. 配置 EdgeOne

确保 `edgeone.config.js` 配置正确：

```javascript
module.exports = {
  buildCommand: 'pnpm build',
  outputDirectory: 'out',
  routes: [
    {
      path: '/',
      destination: '/index.html',
    },
  ],
  // ... 其他配置
};
```

#### 3. 部署

可以通过以下方式部署：

- **Git 集成**：在 EdgeOne Pages 控制台连接 Git 仓库
- **CLI 部署**：使用 EdgeOne CLI 工具
- **手动上传**：上传 `out` 目录内容

#### 4. 验证部署

1. 访问部署的域名
2. 检查页面是否正常加载
3. 验证 Firestore 数据是否正常显示

### 注意事项

- 确保 Firebase 配置正确（`firebase-applet-config.json`）
- EdgeOne 会自动应用 `edgeone.config.js` 中的路由和缓存规则

---

## 部署到 Vercel

### 前提条件

1. Vercel 账号已创建
2. GitHub 仓库已连接
3. GitHub Secrets 中配置了以下变量：
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

### 部署方式

#### 方式 A：GitHub Actions 自动部署（推荐）

推送到 `main` 分支时自动部署：

```bash
git push origin main
```

CI/CD 流程会自动：
1. 运行测试
2. 构建项目（`pnpm build`）
3. 部署到 Vercel

#### 方式 B：手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### Vercel 配置

项目根目录的 `vercel.json` 已配置：

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "out",
  "framework": "nextjs"
}
```

### 环境变量配置

在 Vercel 项目设置中配置：

1. Firebase 相关配置（如果使用环境变量）
2. 其他必要的环境变量

### 验证部署

1. 访问 Vercel 分配的域名
2. 检查 CI/CD 部署日志
3. 验证功能正常

---

## Firebase Cloud Functions 部署

### 重要说明

Cloud Functions 用于后台监控任务，**独立于前端部署**。

### 部署步骤

#### 1. 安装 Firebase CLI

```bash
npm install -g firebase-tools
```

#### 2. 登录 Firebase

```bash
firebase login
```

#### 3. 选择项目

```bash
firebase use your-project-id
```

#### 4. 部署 Functions

```bash
# 使用项目脚本
pnpm deploy:functions

# 或直接使用 Firebase CLI
cd functions
npm install
firebase deploy --only functions
```

### Functions 说明

项目包含以下 Cloud Functions：

- **`scheduledMonitor`**：每 5 分钟自动执行，检查所有 LLM API 状态
- **`getApiStatus`**：HTTP 可调用函数（当前未使用，保留备用）
- **`manualCheck`**：手动触发检查（当前未使用，保留备用）

### 验证 Functions 部署

```bash
# 查看 Functions 日志
firebase functions:log
```

---

## Firebase Firestore 配置

### 部署安全规则

```bash
firebase deploy --only firestore:rules
```

### 配置索引（如需要）

```bash
firebase deploy --only firestore:indexes
```

### Firestore 数据结构

#### `api_status` 集合

存储各 API 的最新状态：

```typescript
{
  id: string;           // API 唯一标识
  name: string;          // API 名称
  provider: string;      // 提供商
  url: string;           // API URL
  status: 'online' | 'offline';
  latency: number;       // 响应延迟（毫秒）
  lastChecked: string;   // 最后检查时间（ISO 格式）
  error?: string;        // 错误信息（如有）
  retries?: number;      // 重试次数
}
```

#### `status_history` 集合

存储历史状态记录：

```typescript
{
  apiId: string;         // API 唯一标识
  status: 'online' | 'offline';
  latency: number;
  timestamp: Timestamp;  // Firestore Timestamp
}
```

#### `alerts` 集合

存储告警记录：

```typescript
{
  apiId: string;
  apiName: string;
  type: 'downtime' | 'latency';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Timestamp;
  resolved: boolean;
  error?: string;
  latency?: number;
}
```

---

## 本地开发

### 启动本地服务器

```bash
pnpm dev
```

访问 `http://localhost:3000`

### 启动 Firestore 模拟器（可选）

```bash
firebase emulators:start
```

### 运行测试

```bash
pnpm test
```

### 构建生产版本

```bash
pnpm build
```

构建产物在 `out` 目录。

---

## 故障排查

### 前端不显示数据

1. 检查 Firestore 连接配置
2. 验证 Firebase 项目的安全规则
3. 查看浏览器控制台错误

### Functions 不执行

1. 检查 Functions 部署状态：`firebase functions:list`
2. 查看 Functions 日志：`firebase functions:log`
3. 确认 Pub/Sub 权限配置

### 部署失败

1. 检查 Node.js 版本（需要 20+）
2. 确认依赖安装成功
3. 查看 CI/CD 日志定位问题

---

## 相关文件

- [vercel.json](file:///workspace/vercel.json) - Vercel 部署配置
- [edgeone.config.js](file:///workspace/edgeone.config.js) - EdgeOne Pages 配置
- [firebase.json](file:///workspace/firebase.json) - Firebase 项目配置
- [.github/workflows/ci-cd.yml](file:///workspace/.github/workflows/ci-cd.yml) - CI/CD 流程
- [functions/src/index.ts](file:///workspace/functions/src/index.ts) - Cloud Functions 源码

---

## 版本信息

- **当前版本**：v2.5.1
- **更新日期**：2026-05-21
- **更新内容**：移除 API 路由依赖，改为纯 Firestore 实时监听架构
