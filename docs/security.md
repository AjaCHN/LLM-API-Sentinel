# 安全架构 (Security)

本文档汇总 LLM API Sentinel 的安全设计与最佳实践。更详细的审计报告见仓库根目录的 `security_best_practices_report.md`。

## 1. 认证与授权

- **登录方式**：手动健康检查受 Supabase Auth 保护，使用 **Google OAuth** 单点登录。
- **客户端访问**：前端使用 `NEXT_PUBLIC_SUPABASE_ANON_KEY`（匿名公钥），所有数据库访问受 **Row Level Security (RLS)** 约束。
- **服务端访问**：后台写入使用 `SUPABASE_SERVICE_ROLE_KEY`，该密钥绕过 RLS，**仅用于服务端**，绝不可暴露到浏览器。

## 2. 数据保护

- **密钥隔离**：`.env.local` 已被 `.gitignore` 忽略；公开变量需加 `NEXT_PUBLIC_` 前缀，私密变量（service role key）不加。
- **无硬编码密钥**：代码库中不包含任何真实 API Key / Token / 密码。
- **用户校验**：所有来自前端的输入在写入前经 Schema（`safeParse`）校验，防范注入与异常数据。

## 3. 传输与响应头安全

部署平台（`vercel.json` / `edgeone.config.js`）统一附加以下响应头：

| 响应头 | 值 | 作用 |
|--------|-----|------|
| `X-Content-Type-Options` | `nosniff` | 禁止 MIME 嗅探 |
| `X-Frame-Options` | `DENY` | 禁止被 iframe 嵌套（防点击劫持） |
| `X-XSS-Protection` | `1; mode=block` | 启用浏览器 XSS 过滤 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | 限制 Referer 泄露 |

在可选自建模式（`server.ts`）下，额外通过 **Helmet** 中间件强化上述头部。

## 4. 速率限制（自建模式）

`server.ts` 对 `/api/check` 手动检查接口施加 **按 IP 速率限制**（默认每 15 分钟最多 30 次），防范滥用与暴力探测。

## 5. 静态导出与攻击面

- 默认采用静态导出（`output: 'export'`），前端不包含服务端 API 路由，攻击面仅限静态资源与 Supabase 接口。
- 静态资源（JS/CSS）设置 `Cache-Control: public, max-age=31536000, immutable`，HTML 设为 `no-cache, must-revalidate`，兼顾性能与及时更新。

## 6. 已废弃组件

- Firebase 后端已迁移至 Supabase，相关配置变量仅保留作迁移参考，不再用于生产。

## 7. 安全清单（部署前自查）

- [ ] `.env.local` 未提交到版本库
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 仅存在于服务端/托管环境变量
- [ ] Supabase RLS 策略已启用并覆盖所有表
- [ ] Google OAuth 回调地址已加入 Supabase 白名单
- [ ] 生产环境使用 HTTPS
