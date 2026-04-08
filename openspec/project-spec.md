# 项目规范文档

## 1. 项目概述

LLM API Sentinel 是一个全球主流大模型 API 实时监控与历史可用性追踪系统，旨在为开发者和企业提供可靠的 API 状态监控服务。

### 1.1 核心功能
- **全球监控**：追踪美国（OpenAI, Anthropic, Google, Meta/Groq, Mistral）和中国（Moonshot, 智谱, 百川, 阿里, 腾讯, 百度）主流 AI 供应商的连通性与延迟
- **自主监控**：服务器端后台任务每 5 分钟自动执行 API 检查
- **历史数据**：使用交互式面积图可视化性能趋势
- **实时告警**：API 宕机和高延迟（>1500ms）的通知系统
- **告警管理**：认证用户可以解决活跃告警
- **自适应 UI**：全响应式设计，支持深色/浅色模式切换
- **实时更新**：基于 Firebase Firestore 实现状态即时同步
- **安全访问**：手动健康检查受 Google 身份验证保护
- **地理信息**：实时地理位置检测
- **国际化**：支持多语言界面（ar, cs, en, es, hi, id, it, nl, pl, sv, th, tr, ru, vi, zh-cn, zh-tw）
- **SEO 优化**：全面的元标签和 OpenGraph 支持

### 1.2 技术栈
- **框架**：Next.js 14 (App Router)
- **服务器**：Express (用于后台任务)
- **数据库**：Firebase Firestore
- **身份验证**：Firebase Authentication
- **Firebase Admin**：用于安全的服务器端 Firestore 更新
- **样式**：Tailwind CSS 4
- **图表**：Recharts
- **图标**：Lucide React
- **工具库**：date-fns
- **主题**：next-themes
- **国际化**：next-intl

## 2. 代码规范

### 2.1 文件结构
```
├── app/
│   ├── api/           # API 路由
│   ├── components/    # UI 组件
│   ├── hooks/         # 自定义 hooks
│   ├── lib/           # 工具函数和业务逻辑
│   ├── locales/       # 多语言文件
│   ├── globals.css    # 全局样式
│   ├── layout.tsx     # 布局组件
│   └── page.tsx       # 主页面
├── openspec/          # 项目规范和文档
├── public/            # 静态资源
├── server.ts          # Express 服务器
└── package.json       # 项目配置
```

### 2.2 命名约定
- **文件命名**：使用小写字母和连字符，如 `api-status-grid.tsx`
- **组件命名**：使用 PascalCase，如 `ApiStatusGrid`
- **函数命名**：使用 camelCase，如 `performCheck`
- **变量命名**：使用 camelCase，如 `apiStatus`
- **常量命名**：使用 UPPER_SNAKE_CASE，如 `LATENCY_THRESHOLD`

### 2.3 代码风格
- **缩进**：使用 2 个空格
- **分号**：使用分号结尾
- **引号**：使用单引号
- **换行**：每行不超过 100 字符
- **注释**：
  - 文件头部必须包含版本信息
  - 函数必须有简洁的注释
  - 复杂逻辑必须有内联注释

### 2.4 类型定义
- 使用 TypeScript 类型系统
- 为所有函数参数和返回值添加类型注解
- 为复杂数据结构创建接口定义

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

### 3.3 版本控制
- 使用 SemVer 2.0.0 版本规范
- 每次发布时更新以下文件：
  - 文件头部版本号
  - HTML Title 标签版本号
  - metadata.json 中的版本信息
  - CHANGELOG.md 中的版本记录

## 4. 测试策略

### 4.1 测试类型
- **单元测试**：测试单个函数和组件的功能
- **集成测试**：测试组件之间的交互和数据流
- **端到端测试**：测试完整的用户流程和系统功能

### 4.2 测试覆盖
- 目标覆盖率：≥80%
- 重点测试监控逻辑和数据处理
- 关键功能必须有测试覆盖

### 4.3 测试工具
- **Jest**：用于单元测试和集成测试
- **React Testing Library**：用于组件测试
- **Playwright**：用于端到端测试

### 4.4 具体测试用例

#### 单元测试

##### 1. 监控逻辑测试
```typescript
// tests/unit/monitoring.test.ts
describe('Monitoring Logic', () => {
  test('should detect API downtime', () => {
    // 测试 API 宕机检测逻辑
  });
  
  test('should detect high latency', () => {
    // 测试高延迟检测逻辑
  });
  
  test('should calculate average latency', () => {
    // 测试平均延迟计算逻辑
  });
});
```

##### 2. 告警系统测试
```typescript
// tests/unit/alerts.test.ts
describe('Alert System', () => {
  test('should create alert for downtime', () => {
    // 测试宕机告警创建逻辑
  });
  
  test('should create alert for high latency', () => {
    // 测试高延迟告警创建逻辑
  });
  
  test('should resolve alert', () => {
    // 测试告警解决逻辑
  });
});
```

##### 3. 组件测试
```typescript
// tests/unit/components/ApiStatusGrid.test.tsx
describe('ApiStatusGrid', () => {
  test('should render status cards correctly', () => {
    // 测试状态网格渲染
  });
  
  test('should display offline status correctly', () => {
    // 测试离线状态显示
  });
});
```

#### 集成测试

##### 1. 数据流测试
```typescript
// tests/integration/data-flow.test.ts
describe('Data Flow', () => {
  test('should fetch and display API statuses', () => {
    // 测试从 Firestore 获取数据并显示
  });
  
  test('should handle real-time updates', () => {
    // 测试实时数据更新
  });
});
```

##### 2. 认证流程测试
```typescript
// tests/integration/auth.test.ts
describe('Authentication', () => {
  test('should restrict access to authenticated users', () => {
    // 测试认证流程
  });
  
  test('should allow admin actions for authorized users', () => {
    // 测试管理员权限
  });
});
```

#### 端到端测试

##### 1. 主页面测试
```typescript
// tests/e2e/homepage.test.ts
describe('Homepage', () => {
  test('should load and display API statuses', async ({ page }) => {
    // 测试主页面加载和状态显示
  });
  
  test('should toggle dark/light mode', async ({ page }) => {
    // 测试主题切换
  });
  
  test('should display alerts in dropdown', async ({ page }) => {
    // 测试告警显示
  });
});
```

##### 2. 告警管理测试
```typescript
// tests/e2e/alerts.test.ts
describe('Alert Management', () => {
  test('should resolve alert as authenticated user', async ({ page }) => {
    // 测试告警解决功能
  });
});
```

### 4.5 测试流程

#### 1. 开发阶段
- 编写功能代码的同时编写单元测试
- 确保每个函数和组件都有相应的测试

#### 2. 集成阶段
- 运行集成测试，确保组件之间的交互正常
- 验证数据流和状态管理

#### 3. 部署前
- 运行完整的端到端测试
- 确保所有测试通过
- 检查测试覆盖率

### 4.6 测试配置

#### Jest 配置
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
  },
};
```

#### Playwright 配置
```javascript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run dev',
    port: 3000,
  },
});
```

### 4.7 测试运行命令
- `npm test`：运行所有测试
- `npm run test:watch`：运行测试并监视文件变化
- `npx playwright test`：运行端到端测试
- `npx jest --coverage`：运行测试并生成覆盖率报告

## 5. 性能优化

### 5.1 前端优化
- 使用 React.memo 优化组件渲染
- 合理使用 useState 和 useEffect
- 优化图表渲染性能
- 实现数据缓存策略

### 5.2 后端优化
- 优化监控请求的并发处理
- 实现请求节流和重试机制
- 合理设置缓存策略
- 优化数据库查询

## 6. 安全措施

### 6.1 认证与授权
- 使用 Firebase Authentication 进行身份验证
- 为敏感操作添加权限检查
- 实现请求频率限制

### 6.2 数据安全
- 加密存储敏感信息
- 实现输入验证
- 防止 SQL 注入和 XSS 攻击

### 6.3 错误处理
- 实现全局错误处理
- 记录错误日志
- 提供友好的错误提示

## 7. 部署策略

### 7.1 环境配置

#### 1. 开发环境
- **配置**：本地开发服务器
- **命令**：`npm run dev`
- **端口**：3000
- **环境变量**：`NODE_ENV=development`

#### 2. 测试环境
- **配置**：模拟生产环境
- **命令**：`npm run build && npm start`
- **端口**：3000
- **环境变量**：`NODE_ENV=test`

#### 3. 生产环境
- **配置**：正式部署环境
- **命令**：`npm run build && npm start`
- **端口**：3000
- **环境变量**：`NODE_ENV=production`

### 7.2 部署流程

#### 1. 本地开发流程
1. 克隆代码库：`git clone https://github.com/sutchan/LLM-API-Sentinel.git`
2. 安装依赖：`npm install`
3. 配置 Firebase 项目：
   - 创建 Firebase 项目
   - 启用 Firestore 和 Authentication
   - 生成 `firebase-applet-config.json`
4. 启动开发服务器：`npm run dev`

#### 2. 测试环境部署
1. 合并代码到 `develop` 分支
2. 运行测试：`npm test`
3. 构建项目：`npm run build`
4. 部署到测试服务器

#### 3. 生产环境部署
1. 合并代码到 `main` 分支
2. 运行完整测试：`npm test`
3. 构建项目：`npm run build`
4. 部署到生产服务器
5. 验证部署：检查应用是否正常运行

### 7.3 CI/CD 配置

#### GitHub Actions 配置
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches:
      - main
      - develop

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run build
      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        run: |
          npm install -g vercel
          vercel --prod
```

### 7.4 蓝绿部署策略

1. **部署蓝环境**：
   - 部署新版本到蓝环境
   - 验证蓝环境功能正常

2. **切换流量**：
   - 将流量从绿环境切换到蓝环境
   - 监控系统运行状态

3. **回滚策略**：
   - 如果蓝环境出现问题，立即切回绿环境
   - 分析问题并修复

### 7.5 监控和告警系统

#### 1. 应用监控
- **性能监控**：使用 Vercel Analytics 或 New Relic
- **错误监控**：使用 Sentry
- **用户体验监控**：使用 Google Analytics

#### 2. 系统监控
- **服务器监控**：CPU、内存、磁盘使用情况
- **网络监控**：网络流量、响应时间
- **数据库监控**：Firestore 查询性能、数据使用情况

#### 3. 告警配置
- **邮件告警**：系统故障、性能异常
- **Slack 通知**：部署完成、重要事件
- **SMS 告警**：严重故障（可选）

### 7.6 环境变量配置

#### 开发环境
```env
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### 生产环境
```env
# .env.production
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 7.7 部署注意事项

1. **Firebase 配置**：
   - 确保 Firestore 规则正确配置
   - 启用必要的 Firebase 服务

2. **安全性**：
   - 保护环境变量
   - 确保 API 密钥不被暴露
   - 配置适当的 CORS 策略

3. **性能优化**：
   - 启用静态资源缓存
   - 优化图片和静态文件
   - 配置 CDN 加速

4. **扩展性**：
   - 考虑使用负载均衡
   - 配置自动缩放策略
   - 优化数据库查询

## 8. 国际化

### 8.1 支持语言
- 英语 (en)
- 中文 (zh-CN, zh-TW)
- 西班牙语 (es)
- 阿拉伯语 (ar)
- 法语 (fr)
- 葡萄牙语 (pt-BR)
- 德语 (de)
- 日语 (ja)
- 韩语 (ko)
- 俄语 (ru)
- 其他语言...

### 8.2 国际化实现
- 使用 locales 目录存储翻译文件
- 实现语言切换功能
- 确保所有用户可见文本都已国际化

## 9. 监控与维护

### 9.1 系统监控
- 监控应用性能和可用性
- 记录关键指标和错误
- 实现自动告警机制

### 9.2 维护计划
- 定期更新依赖包
- 定期检查 API 端点
- 优化监控策略

## 10. 代码质量保证

### 10.1 静态分析
- 使用 ESLint 进行代码质量检查
- 使用 TypeScript 进行类型检查
- 配置 pre-commit 钩子

### 10.2 代码审查
- 实施代码审查流程
- 确保代码符合项目规范
- 检查潜在的安全问题

---

本规范文档将作为项目开发的指导原则，确保代码质量和项目一致性。所有团队成员都应遵守本规范，以保证项目的可维护性和可扩展性。