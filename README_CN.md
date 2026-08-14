# LLM API Sentinel v2.8.4

[English](README.md) | [中文](README_CN.md)

全球主流大模型 API 实时监控与历史可用性追踪系统。

## 核心功能

- **全球监控**：追踪美国（OpenAI, Anthropic, Google, Meta, Mistral）和中国（Moonshot/Kimi, ZhipuAI, Baichuan, Alibaba/Qwen, Tencent/Hunyuan, Baidu/Ernie, DeepSeek）主流 AI 供应商的连通性与延迟。
- **历史数据**：使用交互式面积图可视化性能趋势。
- **自适应 UI**：全响应式设计，支持深色/浅色模式切换。
- **实时更新**：基于 Supabase Realtime 实现状态即时同步。
- **安全访问**：手动健康检查受 Google 身份验证保护。
- **安全加固**：可选的自定义服务器（`server.ts`）为手动检查添加 Helmet 安全响应头与按 IP 速率限制。
- **智能告警**：自动检测 API 宕机和延迟过高，并生成告警通知。
- **自主监控**：后台任务每 5 分钟自动执行 API 检查，无需用户干预。
- **性能优化**：
  - 前端：React.memo、useMemo 和限制图表数据点以提升性能
  - 后端：并发请求限制、API 检查重试机制和批量数据库写入
- **地理位置**：实时检测监控节点位置，24小时本地缓存。
- **缓存系统**：多层缓存（内存 + localStorage），智能过期时间计算。
- **国际化**：支持 16 种语言（en, zh-cn, zh-tw, ar, cs, es, hi, id, it, nl, pl, sv, th, tr, ru, vi）。
- **多语言切换**：自动检测浏览器语言，支持手动语言切换。

## 技术栈

- **前端框架**：Next.js 14.2.13 (App Router, 静态导出)
- **可选服务器**：Express 5.2.1 + Helmet（自定义安全服务器，按需启用）
- **数据库**：Supabase PostgreSQL
- **身份验证**：Supabase Auth (Google OAuth)
- **实时订阅**：Supabase Realtime
- **样式**：Tailwind CSS 4.1.11
- **图表**：Recharts 3.8.0
- **图标**：Lucide React
- **状态管理**：Zustand 5.0.12
- **时间处理**：date-fns 4.1.0

## 系统架构

本项目采用 **静态前端 + Supabase 后端** 架构。默认情况下应用静态导出到 `out/` 目录并由静态托管（Vercel / EdgeOne Pages / Netlify）提供，**前端无需自定义服务器**。

```
┌──────────────────┐     ┌──────────────────┐
│  静态托管服务     │────▶│    Supabase      │
│  (out/ 导出)     │     │  (PostgreSQL +   │
│                  │     │   Realtime)      │
└──────────────────┘     └──────────────────┘
         ▲                        ▲
         │            ┌──────────┴──────────┐
         │            │  Express (可选)     │
         │            │  server.ts — 手动   │
         │            │  检查 + 安全头/限流 │
         └────────────┘                     │
                      └─────────────────────┘
```

- **前端**：静态导出到 `out/` 目录，可部署到任何静态托管服务
- **实时数据**：Supabase Realtime 订阅（无需轮询）
- **后端**：自主后台监控通过 Supabase（定时函数 / Edge Functions）运行。`server.ts` 为可选的 Express 服务器，用于以 `node server.ts` 自托管时增加 Helmet 安全响应头与按 IP 速率限制。
- **身份验证**：Supabase Auth 集成 Google OAuth

## 快速开始

### 前置条件
- Node.js 18+
- Supabase 账户（或自托管 Supabase）
- Google OAuth 凭证

### 环境配置

1. 复制环境变量示例文件并填入你的 Supabase 凭证：

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> 完整变量说明见 [docs/env.md](docs/env.md)。Firebase 配置已废弃，仅保留用于迁移参考。

2. 设置数据库：
   - 在 [supabase.com](https://supabase.com) 创建 Supabase 项目
   - 运行 `supabase/schema.sql` 中的 SQL 脚本
   - 在 Supabase Auth 设置中启用 Google OAuth
   - （可选）通过 Supabase Cron / Edge Functions 配置定时后台监控

3. 安装依赖（本项目使用 `pnpm`）：

```bash
pnpm install
```

4. 启动开发服务器：

```bash
pnpm dev
```

5. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

### 部署

项目已配置为 **静态导出**（`next.config.mjs` 中 `output: 'export'`），可部署到多种静态托管平台：
- **腾讯云 EdgeOne Pages**（见 `edgeone.config.js`）
- **Vercel**（见 `vercel.json`）
- **Netlify**

构建并部署：
```bash
pnpm build   # 静态文件输出到 out/
```

> 如需自托管并启用额外安全加固（Helmet 响应头 + 按 IP 速率限制），可改用可选的 Express 服务器，而非 `next start`：
> ```bash
> pnpm build
> node server.ts
> ```
> 注意：`server.ts` 以自定义服务器模式包装 Next.js，与静态导出**不兼容**——二选一使用。

## API 监控配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 延迟阈值 | 1500ms | 超过此值触发告警 |
| 降级阈值 | 1000ms | 超过此值标记为降级 |
| 最大重试次数 | 2 | API 检查失败重试次数 |
| 重试延迟 | 1000ms | 重试间隔时间 |
| 最大并发请求 | 5 | 同时进行的最大请求数 |
| 后台检查间隔 | 5 分钟 | 自动检查频率 |
| 缓存过期时间 | 30 秒 | 默认缓存有效期 |

## 支持的 API

### 美国供应商
- OpenAI GPT-4o
- Anthropic Claude 3.5
- Google Gemini 1.5
- Meta Llama 3 (Groq)
- Mistral Large

### 中国供应商
- Moonshot V1 (Kimi)
- 智谱 GLM-4
- 百川 2
- 通义千问 Max (阿里巴巴)
- 混元 (腾讯)
- 文心一言 4.0 (百度)
- DeepSeek V3

## 国际化

支持的语言：
- English (en)
- 简体中文 (zh-cn)
- 繁體中文 (zh-tw)
- العربية (ar)
- Čeština (cs)
- Español (es)
- हिन्दी (hi)
- Bahasa Indonesia (id)
- Italiano (it)
- Nederlands (nl)
- Polski (pl)
- Svenska (sv)
- ไทย (th)
- Türkçe (tr)
- Русский (ru)
- Tiếng Việt (vi)

## 项目结构

```
├── app/
│   ├── components/       # React 组件（UI + 仪表盘组件）
│   ├── hooks/           # 自定义 React hooks
│   ├── lib/             # 工具函数和核心逻辑（monitor, geo, fetcher...）
│   ├── store/           # Zustand 状态管理（api/auth/alerts/geo/error）
│   ├── types/           # TypeScript 类型定义
│   ├── constants/       # 应用常量（阈值、默认 API）
│   ├── locales/         # i18n 翻译文件（16 种语言）
│   ├── layout.tsx       # 根布局
│   └── page.tsx         # 主仪表盘页面
├── openspec/            # 项目规范文档（架构、数据模型、UI、功能、变更提案）
├── docs/                # 补充文档（环境变量、部署、安全、贡献指南）
├── supabase/            # 数据库架构（schema.sql）
├── server.ts            # 可选 Express 安全服务器（Helmet + 限流）
├── next.config.mjs      # Next.js 配置（静态导出）
├── vercel.json          # Vercel 部署配置
├── edgeone.config.js    # EdgeOne Pages 部署配置
└── package.json
```

## 相关文档

- [openspec/](openspec/) — 架构、数据模型、UI、功能与变更提案
- [docs/env.md](docs/env.md) — 环境变量参考
- [docs/deployment.md](docs/deployment.md) — 部署指南（Vercel / EdgeOne / 自托管）
- [docs/security.md](docs/security.md) — 安全架构与最佳实践
- [docs/contributing.md](docs/contributing.md) — 贡献指南

## 许可证

MIT
