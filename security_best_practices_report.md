# 安全审查报告

**项目名称**: LLM API Sentinel (`/workspace/app`)  
**审查日期**: 2026-07-17  
**审查范围**: 所有 TypeScript/TSX 源码（排除 `*.test.ts` 与 `node_modules`）  
**审查依据**: OWASP Top 10、Next.js 安全最佳实践、Supabase 安全指南  

---

## 执行摘要

本次对 `/workspace/app` 目录下 **56 个** TS/TSX 文件进行了静态安全审查，共发现 **8 项** 安全相关问题。其中 **Medium 4 项**、**Low 4 项**，未发现 Critical 或 High 级别漏洞。整体代码质量良好，已具备基础的错误脱敏、输入校验和存储隔离意识，但在客户端密钥暴露面、外部数据校验、存储安全及 XSS 防御深度方面仍有提升空间。

---

## 按严重程度分类

### 🔶 Medium（4 项）

| ID | 文件路径 | 行号 | 问题描述 | 影响 | 修复建议 |
|---|---|---|---|---|---|
| SEC-001 | `app/lib/supabase.ts` | 5–6 | 使用 `NEXT_PUBLIC_` 前缀的环境变量暴露 Supabase URL 与 Anon Key 到客户端 Bundle，任何用户均可通过浏览器 DevTools 查看。 | 攻击者可获取 Anon Key 并尝试对 Supabase 项目发起未经审计的 API 调用（RLS 为最后防线）。 | 1) 在 Supabase 中启用并严格配置 Row Level Security (RLS)；2) 将敏感操作迁移至 Next.js API Route / Server Action，使用 Service Role Key 仅在后端执行；3) 定期轮换 Anon Key 并监控异常请求。 |
| SEC-002 | `app/components/StructuredData.tsx` | 65, 69, 73 | 使用 `dangerouslySetInnerHTML` 注入 JSON-LD 结构化数据。 | 若未来该组件的数据来源变为动态/用户可控，将直接引入 XSS 漏洞。当前为硬编码数据，风险可控但模式不安全。 | 使用标准 JSX 插值或 `JSON.stringify` 后通过普通 `children` 渲染；若必须保留 `dangerouslySetInnerHTML`，应在运行时对最终字符串进行 DOMPurify 或严格白名单过滤。 |
| SEC-003 | `app/hooks/useGeoLocation.ts` | 90, 100–106 | 调用第三方服务 `ipapi.co` 获取地理位置后，未对返回字段进行严格校验即写入 localStorage 和 Zustand Store。 | 若 `ipapi.co` 被篡改或响应被中间人篡改，恶意字段（如超长字符串、非法字符）可能污染应用状态或导致存储溢出。 | 对 `data.city`、`data.country_name`、`data.ip` 增加长度限制（如 city ≤ 100 字符）、类型检查和字符白名单过滤后再写入状态。 |
| SEC-004 | `app/constants/index.ts` | 34–47 | `APIS_TO_CHECK` 在模块加载时立即执行 IIFE 读取 `localStorage.getItem('apiConfig')`，且回退到 `DEFAULT_APIS`。虽然检查了 `typeof localStorage`，但解析后的数据未做 schema 校验。 | 若 localStorage 中 `apiConfig` 被恶意篡改（如注入非法 URL、脚本字段），应用启动时即加载不可信配置，可能导致后续 fetch 到恶意地址（SSRF 类风险）。 | 在读取 `localStorage` 配置后，使用严格的 schema 校验（如 Zod）验证字段类型、URL 格式与白名单，不通过则回退到 `DEFAULT_APIS`。 |

### 🔷 Low（4 项）

| ID | 文件路径 | 行号 | 问题描述 | 影响 | 修复建议 |
|---|---|---|---|---|---|
| SEC-005 | `app/lib/notification.ts` | 15, 168–175 | `WebhookConfig` 定义了 `secret` 签名字段，但 `sendWebhookRequest` 中完全没有实现任何签名逻辑（如 HMAC-SHA256）。 | Webhook 请求缺乏身份验证，接收方无法验证消息来源，存在请求伪造与篡改风险。 | 若业务需要，为 DingTalk/Feishu/Discord 等平台实现对应的签名算法（如钉钉的 HMAC-SHA256 Base64 签名），并在请求头中携带 `Timestamp` 与 `Sign`。 |
| SEC-006 | `app/store/geo.ts` | 24–44 | 使用 `zustand/persist` 将地理位置（含可选 IP）持久化到 `localStorage`，未加密。 | 在共享设备或 XSS 场景下，用户地理位置与 IP 信息可被其他脚本读取，存在隐私泄露风险。 | 对持久化的地理位置数据进行加密（如使用 `crypto.subtle` 或至少 `window.btoa` + 简单混淆），或评估是否必须持久化该信息。 |
| SEC-007 | `app/components/ApiConfig.tsx` | 34–40 | `sanitizeInput` 仅替换 `< > " ' \`` 字符，属于黑名单过滤，防御面不足。 | 攻击者可能通过其他 HTML 实体编码、Unicode 变形或事件处理器（如 `javascript:`）绕过过滤。 | 采用白名单策略（仅允许特定字符集，如 `a-zA-Z0-9\s-_`）或引入 `DOMPurify` 进行标准化清理；对于纯文本输入，优先使用 `textContent` 渲染。 |
| SEC-008 | `app/lib/monitor.ts` | 147 | API 检查异常时，将 `error.message` 直接存入缓存与结果对象。 | 若第三方 API 在错误响应中返回了内部路径、堆栈或敏感 tokens，可能导致信息泄露到前端状态与日志。 | 对 `error.message` 增加过滤/截断处理，仅保留预定义的安全错误描述，或使用 `handleError` 统一脱敏后再存储。 |

---

## 安全亮点

以下做法值得肯定：

1. **错误日志脱敏**：`app/lib/error-handler.ts` 在生产环境中仅输出 `code`、`context`、`timestamp` 和截断后的 `message`，避免泄露堆栈与用户数据。
2. **Auth Store 不持久化**：`app/store/auth.ts` 使用 `partialize: () => ({})`，明确不将用户会话写入 localStorage，降低令牌窃取风险。
3. **X-Frame-Options**：`app/layout.tsx` 设置了 `DENY`，有效防止点击劫持。
4. **URL 协议强制**：`app/lib/supabase.ts` 在初始化前强制校验 URL 必须为 `https:` 且包含 `.supabase.`，减少配置错误导致的中间人攻击面。
5. **输入长度限制**：`app/components/ApiConfig.tsx` 对输入框设置了 `MAX_INPUT_LENGTH = 100` 和 `MAX_URL_LENGTH = 200`，降低存储溢出与 DoS 风险。

---

## 附录：审查文件清单

共审查 **56** 个文件（已排除 `*.test.ts`）：

- `app/lib/supabase.ts`
- `app/constants/index.ts`
- `app/lib/metrics.ts`
- `app/lib/notification.ts`
- `app/lib/cache.ts`
- `app/store/index.ts`
- `app/store/auth.ts`
- `app/store/store.ts`
- `app/store/api.ts`
- `app/store/error.ts`
- `app/store/alerts.ts`
- `app/store/geo.ts`
- `app/hooks/use-mobile.ts`
- `app/hooks/useGeoLocation.ts`
- `app/hooks/useAlerts.ts`
- `app/hooks/useDashboardData.ts`
- `app/hooks/useAuth.ts`
- `app/hooks/useApiMonitor.ts`
- `app/hooks/useI18n.ts`
- `app/lib/concurrency.ts`
- `app/lib/mock-data.ts`
- `app/lib/error-handler.ts`
- `app/lib/i18n.ts`
- `app/lib/monitor.ts`
- `app/lib/utils.ts`
- `app/types/index.ts`
- `app/components/DashboardHeader.tsx`
- `app/components/ApiConfig.tsx`
- `app/components/StatusDot.tsx`
- `app/components/ThemeProvider.tsx`
- `app/components/GeoOptInDialog.tsx`
- `app/components/LatencyHistoryChart.tsx`
- `app/components/DashboardClient.tsx`
- `app/components/AlertsDropdown.tsx`
- `app/components/DashboardSkeleton.tsx`
- `app/components/StatCard.tsx`
- `app/components/StructuredData.tsx`
- `app/components/ChartSkeleton.tsx`
- `app/components/ui/*.tsx`（11 个 UI 组件）
- `app/components/StatusGrid.tsx`
- `app/components/DashboardFooter.tsx`
- `app/components/ProgressBar.tsx`
- `app/components/ApiStatusGrid.tsx`
- `app/layout.tsx`
- `app/page.tsx`
- `app/lib/error.tsx`
