---
alwaysApply: true
scene: project
---

# LLM API Sentinel 项目规范

## 项目标识

- **项目名称**: LLM API Sentinel
- **版本**: v2.5.0
- **仓库**: https://github.com/sutchan/LLM-API-Sentinel

## 技术栈

| 类别 | 技术 | 版本 |
|-----|------|------|
| 前端框架 | Next.js (App Router) | 14.2.13 |
| 后端服务器 | Express | 5.2.1 |
| 数据库 | Firebase Firestore | - |
| 身份验证 | Firebase Auth (Google OAuth) | - |
| 样式 | Tailwind CSS | 4.1.11 |
| 图表 | Recharts | 3.8.0 |
| 图标 | Lucide React | - |
| 国际化 | next-intl | 4.8.3 |
| 时间处理 | date-fns | 4.1.0 |

## 文件头注释 (必须)

所有代码文件第一行必须是单行注释，格式如下：

```
app/components/ApiStatusGrid.tsx v2.5.0
```

- 路径使用相对于项目根目录的路径
- 版本号必须与 `metadata.json` 中的版本保持同步
- 不允许添加多行 Author/License 注释块

## 目录结构

```
llm-api-sentinel/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由 (如 /api/check)
│   ├── components/        # UI 组件
│   ├── hooks/             # 自定义 React hooks
│   ├── lib/               # 工具函数和业务逻辑
│   ├── locales/           # 国际化翻译文件 (en.json, zh-cn.json, etc.)
│   ├── store/             # Zustand 状态管理
│   ├── types/             # TypeScript 类型定义
│   ├── constants/         # 常量定义
│   ├── layout.tsx         # 根布局组件
│   └── page.tsx           # 主页面
├── server.ts              # Express 后台监控服务器
├── openspec/              # 项目规范文档 (不应用于生产代码)
└── .trae/rules/           # Trae IDE 规则文件
```

## 命名约定

| 类型 | 约定 | 示例 |
|-----|------|------|
| 文件名 | 小写字母 + 连字符 | `api-status-grid.tsx` |
| 组件 | PascalCase | `ApiStatusGrid` |
| 函数 | camelCase | `performHealthCheck` |
| 变量 | camelCase | `apiStatus` |
| 常量 | UPPER_SNAKE_CASE | `MAX_CONCURRENT` |
| 类型/接口 | PascalCase | `ApiStatus` |
| 翻译 Key | 小写 + 点分隔 | `dashboard.title` |

## 版本控制 (SemVer 2.0.0)

### 版本号格式
```
主版本.次版本.修订号
2.5.0
```

### 版本同步要求

修改代码并更新版本时，必须**原子化**执行以下所有操作：

1. **文件头部版本号**: 更新当前文件的第一行注释
2. **HTML Title**: 更新 `app/layout.tsx` 中 `<title>` 标签尾部的版本号
3. **Metadata**: 更新 `metadata.json` 中的 `name` 字段
4. **Changelog**: 在 `CHANGELOG.md` 中新增条目 (递增 Patch，不记录日期)
5. **Import Map**: 检查 `app/layout.tsx` 中的 `<importmap>`，确保库版本一致

### CHANGELOG 格式

```markdown
## [2.5.0]
### Added
- 新功能描述

### Changed
- 变更描述

### Fixed
- 修复描述
```

## 受保护文件 (禁止删除/移动)

- `app/app.tsx` (项目入口)
- `app/index.tsx` (主渲染入口)

## README 维护规范

- `README.md` (英文) 和 `README_CN.md` (中文) 必须始终存在
- 两个文件头部必须通过链接互联：`[English](README.md) | [中文](README_CN.md)`
- 版本号必须在两个文件中保持一致

## 分支管理

| 分支 | 用途 |
|-----|------|
| main | 生产环境 |
| dev | 开发集成 |
| feature/* | 新功能开发 |
| fix/* | Bug 修复 |

## Git 提交规范

遵循 `.trae/rules/git-commit-message.md` 中的规范：

```
<type>: <description>

[可选正文]

[可选页脚]
```

主要类型：feat, fix, docs, style, refactor, test, chore, perf, ci, revert

## 代码风格

| 规则 | 值 |
|-----|---|
| 缩进 | 2 空格 |
| 分号 | 必须使用 |
| 引号 | 单引号 (JSX 中使用双引号) |
| 行宽 | ≤100 字符 |
| 函数注释 | 必须有简练注释 |

## 国际化 (L10n)

### 支持语言

en, zh-CN, zh-TW, es, ar, fr, pt-BR, de, ja, ko, ru, cs, hi, id, it, nl, pl, sv, th, tr, vi

### 翻译文件位置
- `app/locales/*.json`

### L10n 规则

- 发现硬编码中文字符串时，自动提取并更新到翻译文件
- 翻译 Key 使用小写 + 点分隔：`dashboard.title`
- 确保所有用户可见文本都已国际化

## 测试规范

### 测试命令
```bash
npm test        # 运行所有测试
npm run lint    # ESLint 检查
```

### 测试覆盖率目标
- 单元/集成测试覆盖率 ≥80%

### 测试文件命名
- 单元测试：`*.test.ts`
- 组件测试：`*.tsx`
- 测试辅助：`jest.setup.cjs`, `jest.config.cjs`

## 后台监控任务 (server.ts)

| 参数 | 值 | 说明 |
|-----|-----|------|
| 检查间隔 | 5 分钟 | 后台自动检查 |
| 初始延迟 | 10 秒 | 服务器启动后首次执行 |
| 最大并发 | 5 | 同时检查的 API 数量 |
| 最大重试 | 2 | 失败后的重试次数 |
| 重试延迟 | 1000ms | 重试间隔 |

### 监控的 API

**美国区**:
- OpenAI (GPT-4, GPT-4o, GPT-4o-mini)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)
- Google (Gemini Pro)
- Meta (Llama 3)
- Mistral

**中国区**:
- Moonshot V1 (Kimi)
- 智谱 GLM-4
- 百川 2
- Qwen Max (阿里巴巴)
- 混元 (腾讯)
- 文心 4.0 (百度)
- 深度求索 V3

## Firestore 数据结构

| 集合 | 用途 | 路径 |
|-----|------|------|
| api_status | API 当前状态 | `/api_status/{apiId}` |
| status_history | 历史性能数据 | `/status_history/{historyId}` |
| alerts | 系统告警 | `/alerts/{alertId}` |

## 构建与部署

### 环境要求
- Node.js 20+
- pnpm 9+

### 构建命令
```bash
pnpm install      # 安装依赖
pnpm build        # 构建生产版本
pnpm dev          # 开发模式
pnpm lint         # 代码检查
pnpm test         # 运行测试
```

### CI/CD
- 使用 `.github/workflows/ci-cd.yml` 定义自动化流程
- Firebase 部署配置: `firebase-applet-config.json`
- Firestore 安全规则: `firestore.rules`

## 告警规则

- 同一类型的未解决告警不会重复创建
- 延迟阈值基于历史数据动态评估
- 告警严重程度：critical > warning > info
