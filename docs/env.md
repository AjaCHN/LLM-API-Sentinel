# 环境变量参考 (Environment Variables)

本文件说明 LLM API Sentinel 运行时所需的环境变量。所有变量均在项目根目录的 `.env.local` 中配置（参考 `.env.example`）。

> 注意：`.env.local` 已被 `.gitignore` 忽略，切勿提交密钥。`.env.example` 仅作为模板，不含任何真实凭证。

## 变量清单

| 变量名 | 必填 | 用途 | 说明 |
|--------|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 是 | 客户端 Supabase 地址 | 浏览器可见的公开变量，格式为 `https://<project-id>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 是 | 客户端匿名公钥 | 用于前端访问 Supabase（受 RLS 策略约束） |
| `SUPABASE_SERVICE_ROLE_KEY` | 是* | 服务端密钥 | 仅用于服务端（后台监控写入），**绕过 RLS**，切勿暴露到前端 |

\* 若仅运行前端静态导出且后台监控由 Supabase 托管函数执行，则 `SUPABASE_SERVICE_ROLE_KEY` 由托管环境注入，本地 `.env.local` 可留空。

## 配置步骤

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

变量取值可在 Supabase 项目控制台的 **Settings → API** 中获取。

## 已废弃变量（迁移参考）

项目早期使用 Firebase 做后端，相关变量已废弃，仅供迁移参考：

```env
# FIREBASE_PROJECT_ID=
# FIREBASE_CLIENT_EMAIL=
# FIREBASE_PRIVATE_KEY=
```

请勿在新部署中使用上述 Firebase 变量。

## 安全注意事项

- `SUPABASE_SERVICE_ROLE_KEY` 拥有数据库完全读写权限，**只能**出现在服务端代码或托管平台的环境变量中，绝不可加 `NEXT_PUBLIC_` 前缀。
- 前端通过 `NEXT_PUBLIC_` 前缀的变量访问 Supabase 时，所有数据访问都应受 **Row Level Security (RLS)** 策略保护。
- 切勿将 `.env.local` 提交到版本库（已在 `.gitignore` 中排除）。
