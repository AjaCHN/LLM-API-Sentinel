# 安全最佳实践审查报告

## 执行摘要

本报告对 LLM API Sentinel 项目进行了全面的安全审查，涵盖 Next.js 前端、Express 后端和 Supabase 集成。共发现 **10 个安全问题**，其中 **2 个高优先级**，**5 个中优先级**，**3 个低优先级**。

项目整体安全状况良好，主要的安全风险集中在安全头配置和 Express 服务器加固方面。

---

## 严重程度说明

- **Critical / 严重**：可直接导致系统被入侵、数据泄露或服务中断
- **High / 高**：可能导致敏感信息泄露、权限绕过或重大安全漏洞
- **Medium / 中**：存在安全风险但利用难度较高，或影响范围有限
- **Low / 低**：防御性不足、信息泄露或最佳实践缺失

---

## 高优先级问题 (High)

### SEC-001: StructuredData 组件存在 XSS 风险

**严重程度**: High  
**位置**: [app/components/StructuredData.tsx](file:///workspace/app/components/StructuredData.tsx#L63-L74)

**问题描述**:
使用 `dangerouslySetInnerHTML` 注入 `JSON.stringify` 输出的结构化数据。虽然 JSON.stringify 会转义大多数字符，但存在以下风险：
- 如果数据包含 `</script>` 等字符串，可能绕过转义
- 浏览器在解析 `<script>` 标签内容时有特殊行为
- 不符合 React 安全最佳实践

**证据**:
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
/>
```

**影响**:
- 理论上可能存在 XSS 攻击向量（如果数据包含用户可控内容）
- 违反安全编码最佳实践

**修复方案**:
使用 React 的 `dangerouslySetInnerHTML` 前对 JSON 进行额外转义，或使用更安全的方式注入脚本内容。对特殊字符进行完整转义。

---

### SEC-002: Express 服务器缺少安全头和基础加固

**严重程度**: High  
**位置**: [server.ts](file:///workspace/server.ts#L267-L280)

**问题描述**:
Express 服务器缺少基本的安全加固措施：
1. 未使用 `helmet` 中间件设置安全头
2. 未禁用 `X-Powered-By` 头（信息泄露）
3. 没有自定义错误处理中间件（可能泄露堆栈信息）
4. 没有明确的 body size 限制配置

**证据**:
```typescript
const server = express();
server.use(rateLimitMiddleware);
// 缺少 helmet、错误处理等安全中间件
```

**影响**:
- 缺少 CSP、X-Content-Type-Options、Referrer-Policy 等安全头
- 暴露服务器技术栈信息（X-Powered-By: Express）
- 生产环境可能泄露错误堆栈信息
- 可能受到各种基于头的攻击

**修复方案**:
1. 添加 `helmet` 中间件并配置合理的 CSP
2. 禁用 `X-Powered-By`
3. 添加自定义 404 和错误处理中间件
4. 配置 express.json 的 body 大小限制

---

## 中优先级问题 (Medium)

### SEC-003: 缺少内容安全策略 (CSP)

**严重程度**: Medium  
**位置**: [app/layout.tsx](file:///workspace/app/layout.tsx) 和 [server.ts](file:///workspace/server.ts)

**问题描述**:
应用没有部署内容安全策略（CSP）。CSP 是防御 XSS 攻击的重要纵深防御措施。

当前仅设置了：
```html
<meta httpEquiv="X-Frame-Options" content="DENY" />
```

**影响**:
- 无法有效防御 XSS 攻击的影响
- 缺少对第三方资源加载的控制
- 不符合现代 Web 安全最佳实践

**修复方案**:
1. 在 layout.tsx 或通过 middleware 添加 CSP header
2. 使用合理的策略，限制脚本、样式、图片等资源来源
3. 优先使用 HTTP 头方式而非 meta 标签

---

### SEC-004: next.config.mjs 中 ESLint 检查被禁用

**严重程度**: Medium  
**位置**: [next.config.mjs](file:///workspace/next.config.mjs#L6-L8)

**问题描述**:
构建时忽略 ESLint 错误，可能导致有问题的代码进入生产环境。

**证据**:
```javascript
eslint: {
  ignoreDuringBuilds: true,
},
```

**影响**:
- 代码质量问题可能被带入生产环境
- 安全相关的 ESLint 规则（如 no-eval、no-implied-eval）无法生效
- 降低了构建时的安全检查力度

**修复方案**:
修复所有 ESLint 错误，启用构建时 ESLint 检查。如果暂时无法修复所有问题，至少启用安全相关规则。

---

### SEC-005: localStorage 存储未进行充分的输入验证

**严重程度**: Medium  
**位置**: [app/lib/cache.ts](file:///workspace/app/lib/cache.ts), [app/lib/i18n.ts](file:///workspace/app/lib/i18n.ts) 等

**问题描述**:
从 localStorage 读取的数据被认为是可信的，但实际上 localStorage 可能被 XSS 攻击或本地用户篡改。

虽然 cache.ts 中有 `isValidCache` 验证，但其他地方（如 i18n、geolocation）可能缺少充分验证。

**影响**:
- 如果存在 XSS 漏洞，攻击者可能篡改 localStorage 数据
- 恶意数据可能导致应用行为异常
- 存储的数据格式错误可能导致运行时错误

**修复方案**:
1. 所有从 localStorage 读取的数据都应进行 schema 验证
2. 对于敏感操作，不要信任客户端存储的数据
3. 使用类型守卫和验证函数确保数据完整性

---

### SEC-006: Supabase 匿名密钥硬编码在客户端

**严重程度**: Medium  
**位置**: [app/lib/supabase.ts](file:///workspace/app/lib/supabase.ts)

**问题描述**:
`NEXT_PUBLIC_SUPABASE_ANON_KEY` 在客户端代码中可用。虽然这是 Supabase 的标准做法（anon key 设计为公开的），但需要确保：
1. RLS（行级安全）策略正确配置
2. anon key 权限被最小化

**当前状态**:
从 openspec/data.md 来看，RLS 策略已正确配置（公开读，认证用户写）。

**影响**:
- 如果 RLS 配置有误，攻击者可直接访问数据库
- anon key 可被任何人提取和使用

**修复方案**:
1. 确认 RLS 策略已正确启用并配置
2. 定期审查 RLS 策略的最小权限原则
3. 文档化 anon key 的使用范围和限制

---

### SEC-007: 速率限制使用内存存储（生产环境限制）

**严重程度**: Medium  
**位置**: [server.ts](file:///workspace/server.ts#L25-L56)

**问题描述**:
当没有配置 Redis 时，速率限制使用内存存储。这在多实例部署时无法正常工作，且重启后计数清零。

**证据**:
```typescript
class MemoryRateLimiter implements RateLimiter {
  private map = new Map<string, { count: number; resetTime: number }>();
  // ...
}
```

**影响**:
- 多实例部署时速率限制失效
- 服务器重启后可被绕过
- 内存泄漏风险（虽然有清理机制）

**修复方案**:
1. 生产环境强制使用 Redis/Upstash
2. 文档化内存存储仅限开发环境
3. 考虑添加分布式锁或共享存储

---

## 低优先级问题 (Low)

### SEC-008: 默认 SITE_URL 硬编码

**严重程度**: Low  
**位置**: [app/layout.tsx](file:///workspace/app/layout.tsx#L18), [app/components/StructuredData.tsx](file:///workspace/app/components/StructuredData.tsx#L3)

**问题描述**:
`NEXT_PUBLIC_SITE_URL` 的默认值硬编码为生产域名。虽然不是严重安全问题，但可能导致：
- 开发环境意外指向生产 URL
- 配置不一致

**修复方案**:
使用更安全的默认值（如 localhost），或在开发环境给出明确警告。

---

### SEC-009: 缺少 Subresource Integrity (SRI) 用于第三方资源

**严重程度**: Low  
**位置**: [app/layout.tsx](file:///workspace/app/layout.tsx#L111-L117)

**问题描述**:
从第三方域名加载的资源（Google Fonts、Supabase）没有使用 SRI。

**影响**:
- 如果第三方 CDN 被攻破，可能加载恶意代码
- 供应链攻击风险

**修复方案**:
1. 考虑自托管关键资源
2. 对第三方脚本/样式添加 integrity 哈希
3. 使用 CSP 进一步限制资源来源

---

### SEC-010: Google Site Verification 代码占位符

**严重程度**: Low  
**位置**: [app/layout.tsx](file:///workspace/app/layout.tsx#L89-L91)

**问题描述**:
Google 站点验证使用占位符值。

**证据**:
```typescript
verification: {
  google: 'google-site-verification-code',
},
```

**影响**:
- 低风险，主要是配置问题
- 如果是真实的验证代码应保密

**修复方案**:
使用环境变量配置，或移除占位符。

---

## 安全优势 (Security Strengths)

项目在以下方面做得很好：

1. ✅ **RLS 策略正确配置** - Supabase 行级安全策略合理
2. ✅ **错误消息脱敏** - sanitizeErrorMessage 函数清理敏感信息
3. ✅ **环境变量验证** - supabase.ts 中有环境变量验证
4. ✅ **缓存验证** - cache.ts 中有类型和格式验证
5. ✅ **.gitignore 正确** - .env 文件被正确忽略
6. ✅ **错误处理** - 有统一的错误处理机制
7. ✅ **速率限制** - 实现了基础的速率限制
8. ✅ **Supabase Auth** - 使用专业的认证服务

---

## 修复优先级建议

| 优先级 | 问题 ID | 预计修复时间 |
|-------|---------|------------|
| P0 (立即) | SEC-001, SEC-002 | 2-3 小时 |
| P1 (本周) | SEC-003, SEC-004, SEC-005 | 4-6 小时 |
| P2 (本月) | SEC-006, SEC-007, SEC-008 | 2-3 小时 |
| P3 (可选) | SEC-009, SEC-010 | 1 小时 |

---

## 报告信息

- **审查日期**: 2026-07-17
- **审查范围**: Next.js 前端、Express 后端、Supabase 集成
- **参考标准**: OWASP Top 10、Next.js 安全指南、Express 安全最佳实践
- **审查工具**: 手动代码审查 + 安全最佳实践检查清单
