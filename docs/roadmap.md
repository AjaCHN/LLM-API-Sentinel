# 发展路线与改进建议 (Roadmap & Improvement Proposals)

本文档基于项目当前状态（v2.10.23：静态前端 + Supabase 后端、29 个中美 API 实时监控、16 语言、Recharts 图表、浅色/深色双主题、可选 Express 安全服务器、CI/CD 已落地、真实探测无演示数据），提出务实的发展方向。按优先级分为短期、中期、长期三类，并单列工程质量项。

## 当前能力基线

- **监控对象**：29 个主流 LLM API（美国 16 家 + 中国 13 家），覆盖 OpenAI / Anthropic / Google / Meta / Mistral / xAI / Cohere / Perplexity / 智谱 / 阿里 / 腾讯 / 百度 / DeepSeek / Kimi / 火山等。
- **核心功能**：连通性 + 延迟监控、实时状态网格（扁平、不按供应商分组）、历史趋势（24H/7D/30D）、阈值告警、Google OAuth 保护、Supabase Realtime 同步。**数据真实性**：v2.10.22 起移除全部演示数据注入，Supabase 未配置/加载失败时为空态（骨架占位）等待真实探测；累计指标（可用性/延迟）经 `metrics-storage.ts` 真实写入 localStorage 跨刷新累加。
- **部署**：默认静态导出（`out/`）至 Vercel / EdgeOne / Netlify；可选 `examples/self-host-server.ts` 自建安全服务器（Helmet + 限流）。
- **工程现状**：Jest + 覆盖率门禁已接入（`jest.config.cjs` 设 statements/functions/lines ≥ 70%）；CI（`ci.yml`）+ Release（`release.yml`）已上线；多渠道告警已支持 Webhook / Slack / Discord / Teams / 钉钉 / 飞书；Firebase 残留配置仅作迁移参考。

---

## 短期（稳定性与工程化）

### 1. 引入 CI/CD（✅ 已完成）
- `ci.yml`：PR/push 到 main/dev 触发 `pnpm lint` + `pnpm test --coverage` + `pnpm build` 门禁。
- `release.yml`：语义化版本 tag 触发静态产物构建与 GitHub Release。
- 门禁：测试/覆盖未过禁止合并（配合 PR 模板检查清单）。

### 2. 补全单元测试与覆盖率（🟡 进行中）
- 已覆盖纯逻辑模块：`app/lib/monitor.ts`、`cache-*.ts`、`concurrency.ts`、`i18n.ts`、`metrics.ts`、`notification-platforms.ts`、`webhook-formatter.ts`、`utils.ts`、`supabase-mapping.ts`、`cache-validation.ts`、`notification.ts`。
- `jest.config.cjs` 已设覆盖率阈值（statements/functions/lines ≥ 70%）。
- 待补：为 `LatencyHistoryChart` 等 SVG 组件补快照测试；提升 branches 覆盖率。

### 3. 落地后台监控的官方示例（✅ 已完成）
- 已提供 `supabase/functions/monitor/index.ts` 示例 Edge Function（探测 29 API 并写入 `api_status` / `status_history`，含 SSRF 防护与超时中断）。
- 已提供 `supabase/cron.sql` 示例（pg_cron 每 5 分钟调度 + 90 天数据保留策略）。

---

## 中期（功能增强）

### 4. 扩展监控维度
- **成本/配额感知**：除连通性与延迟外，记录 429 / 配额耗尽状态，区分"宕机"与"限流"。
- **模型级可用性**：部分供应商多模型端点，细化到模型粒度的健康度。
- **多地域探测**：同一 API 从多个地理节点探测，呈现区域差异延迟。

### 5. 历史 SLA 与公开状态页
- 基于历史数据计算**滚动可用性百分比**（如 30 天 uptime %），在卡片/状态页展示。
- 提供独立公开状态页（子路径 `/status` 或独立子域），无需登录即可查看，利于对外公示服务状态。

### 6. 可配置监控目标
- 允许登录用户在 UI 中添加自定义 API endpoint（URL + 预期状态码 + 检查频率）。
- 持久化到 Supabase，纳入统一监控与告警。

### 7. 多渠道告警
- 除站内横幅外，支持 Webhook、Email、Slack、Discord、Telegram 推送。
- 告警规则可配置（阈值、静默窗口、升级策略）。

---

## 长期（平台化）

### 8. 多语言公开状态页 + SEO
- 公开状态页支持 16 语言切换（复用现有 i18n 体系），利于全球用户。
- 为状态页配置结构化数据（JSON-LD）与 sitemap，提升搜索引擎可见性。

### 9. 公开状态 API 与嵌入式组件
- 提供只读公开 API（带限流），供第三方查询状态。
- 提供可嵌入的轻量状态徽章/Widget（`<script>` 或 iframe），供其他站点展示本服务状态。

### 10. 移动端体验
- 当前为响应式 Web；可考虑 PWA（离线缓存状态快照 + 推送通知）或独立移动 App。

### 11. 周期报告与导出
- 自动生成周/月可用性报告（PDF / 邮件）。
- 支持历史数据 CSV 导出。

---

## 工程质量与技术债

### 12. 清理 Firebase 残留
- 扫描并移除遗留的 Firebase 配置变量与死代码路径，仅保留迁移注释，降低维护认知负担。

### 13. 统一运行模式叙事
- 静态导出与 `server.ts` 自定义服务器互斥，已在 README/openspec 文档澄清。建议：
  - 若社区以静态托管为主，可将 `server.ts` 降级为 `examples/self-host-server.ts`，避免误解为默认路径；（已完成）
  - 或将安全头/限流逻辑移植到 Edge 中间件，使静态托管也能获得同等加固。

### 14. 数据保留与聚合策略
- 定义历史数据保留窗口（如 90 天明细 + 聚合归档），控制 Supabase 存储成本与查询性能。

### 15. 可访问性 (a11y) 审计
- 对状态网格、图表、对话框做 WCAG AA 审计（对比度、键盘导航、ARIA），当前纯深色主题需验证色盲友好性。

---

## 建议落地顺序

1. ~~**CI/CD + 测试覆盖**~~（✅ 已完成，持续提升覆盖率）
2. ~~**后台监控示例 + 多渠道告警**~~（✅ 已完成监控示例；多渠道告警已支持 Slack/Teams/Discord/钉钉/飞书）
3. **公开状态页 + SLA**（对外价值最大化）
4. **可配置目标 + 平台化 API**（向多租户/生态演进）
5. 持续清理技术债

> 本路线为建议性文档，具体实现请以 `openspec/changes/` 下的变更提案与 PR 为准。
