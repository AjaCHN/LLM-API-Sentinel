# 发展路线与改进建议 (Roadmap & Improvement Proposals)

本文档基于项目当前状态（v2.9.4：静态前端 + Supabase 后端、12 个中美 API 实时监控、16 语言、手写 SVG 图表、纯深色双档主题、可选 Express 安全服务器），提出务实的发展方向。按优先级分为短期、中期、长期三类，并单列工程质量项。

## 当前能力基线

- **监控对象**：美国 5 家（OpenAI / Anthropic / Google / Meta / Mistral）+ 中国 7 家（Kimi / Zhipu / Baichuan / Qwen / Hunyuan / Ernie / DeepSeek）。
- **核心功能**：连通性 + 延迟监控、实时状态网格、历史趋势（24H/7D/30D）、阈值告警、Google OAuth 保护、Supabase Realtime 同步。
- **部署**：默认静态导出（`out/`）至 Vercel / EdgeOne / Netlify；可选 `server.ts` 自建安全服务器。
- **工程现状**：Jest + Testing Library 已接入，但**尚无 CI**；Firebase 残留配置仅作迁移参考。

---

## 短期（稳定性与工程化）

### 1. 引入 CI/CD（最高优先级）
当前仓库无 `.github/workflows/`，所有 lint/test/build 依赖手动执行。
- 新增 `ci.yml`：PR 时跑 `pnpm lint` + `pnpm test` + `pnpm build`。
- 新增 `deploy-preview.yml`：PR 预览部署（Vercel Preview / EdgeOne 预览）。
- 新增 `release.yml`：打 tag 时自动构建并发布。
- 门禁：测试未过禁止合并（配合现有 PR 模板的检查清单）。

### 2. 补全单元测试与覆盖率
- 优先覆盖纯逻辑模块：`app/lib/monitor.ts`（健康检查协议）、`app/lib/geo.ts`（地理映射）、`app/hooks/useI18n.ts`（持久化与语言检测）。
- 在 `jest.config.cjs` 设定覆盖率阈值（如 statements ≥ 70%），防止回归。
- 为 `LatencyHistoryChart` 等 SVG 组件补快照测试。

### 3. 落地后台监控的官方示例
`docs/deployment.md` 提及后台监控依赖 Supabase Cron / Edge Functions，但缺少可复制的样例。
- 提供 `supabase/functions/monitor/index.ts` 示例 Edge Function（执行 12 API 检查并写入表）。
- 提供 `supabase/cron.sql` 示例（每 5 分钟调度）。
- 降低自托管用户的上手成本。

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
  - 若社区以静态托管为主，可将 `server.ts` 降级为 `examples/self-host-server.ts`，避免误解为默认路径；
  - 或将安全头/限流逻辑移植到 Edge 中间件，使静态托管也能获得同等加固。

### 14. 数据保留与聚合策略
- 定义历史数据保留窗口（如 90 天明细 + 聚合归档），控制 Supabase 存储成本与查询性能。

### 15. 可访问性 (a11y) 审计
- 对状态网格、图表、对话框做 WCAG AA 审计（对比度、键盘导航、ARIA），当前纯深色主题需验证色盲友好性。

---

## 建议落地顺序

1. **CI/CD + 测试覆盖**（立刻提升交付可靠性）
2. **后台监控示例 + 多渠道告警**（让核心监控真正可用、可感知）
3. **公开状态页 + SLA**（对外价值最大化）
4. **可配置目标 + 平台化 API**（向多租户/生态演进）
5. 持续清理技术债

> 本路线为建议性文档，具体实现请以 `openspec/changes/` 下的变更提案与 PR 为准。
