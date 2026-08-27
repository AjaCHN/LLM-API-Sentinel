# 部署指南 (Deployment)

LLM API Sentinel 默认以 **静态导出** 方式构建（由 `next.config.mjs` 的 `output: 'export'` 控制），产物输出到 `out/` 目录。本文档覆盖三种部署路径。

## 1. 通用前置条件

1. Node.js 18+，包管理器使用 `pnpm`。
2. 配置 Supabase 项目并运行 `supabase/schema.sql`。
3. 准备 `.env.local`（参见 [env.md](env.md)）。
4. 在 Supabase Auth 中启用 Google OAuth，并将部署后的回调地址加入白名单。

## 2. 静态托管部署（推荐）

### 2.1 Vercel

项目根已包含 `vercel.json`（构建命令 `pnpm build`，输出目录 `out/`）。

- 在 Vercel 导入仓库，环境变量填入 `.env.local` 中的三个变量。
- 触发部署即可。所有请求重写到 `index.html` 以支持 SPA 路由，并自动附加安全响应头。

### 2.2 腾讯云 EdgeOne Pages

项目根已包含 `edgeone.config.js`（构建命令 `pnpm build`，输出目录 `out/`）。

- 在 EdgeOne Pages 关联仓库，使用上述配置。
- 部署后通过 EdgeOne 提供的域名访问。

### 2.3 Netlify

- 构建命令：`pnpm build`
- 发布目录：`out`
- 在 `netlify.toml` 或控制台中将 SPA 回退设为 `index.html`。

### 构建命令

```bash
pnpm install
pnpm build   # 输出静态文件到 out/
```

## 3. 可选自建模式（Express 安全服务器）

若希望自托管并启用额外安全加固（Helmet 安全响应头 + 按 IP 速率限制），可使用 `examples/self-host-server.ts` 以自定义服务器模式运行：

```bash
pnpm build
node examples/self-host-server.ts
```

`examples/self-host-server.ts` 会：
- 用 Helmet 设置 `X-Content-Type-Options`、`X-Frame-Options`、`X-XSS-Protection`、`Referrer-Policy` 等响应头。
- 对 `/api/check` 手动检查接口施加按 IP 的速率限制（默认每 15 分钟最多 30 次）。
- 以 `next` 自定义服务器方式提供页面。

> ⚠️ 注意：`examples/self-host-server.ts` 使用 Next.js 自定义服务器模式，**与静态导出 (`output: 'export'`) 不兼容**。若使用 `examples/self-host-server.ts`，需将 `next.config.mjs` 中的 `output` 改为 `'standalone'` 或移除该配置，并改用 `node examples/self-host-server.ts` 提供服务，而非静态托管。两者二选一。

## 4. 后台监控任务

无论采用哪种前端部署方式，后台监控（每 5 分钟检查全部 API —— 当前 29 个，并写入 Supabase）建议在 Supabase 侧运行：

- 使用 **Supabase Cron** 定时调用 Edge Function；或
- 部署 Edge Function 并由外部调度器触发。

该设计使前端静态托管无需常驻服务器即可保持监控数据更新。
