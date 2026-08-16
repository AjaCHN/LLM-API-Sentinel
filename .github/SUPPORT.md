# Support

感谢使用 LLM API Sentinel！在遇到问题前，请先尝试以下自助渠道。

## 文档

- [README.md](README.md) / [README_CN.md](README_CN.md) — 项目概览与快速开始
- [docs/env.md](docs/env.md) — 环境变量配置
- [docs/deployment.md](docs/deployment.md) — 部署指南（Vercel / EdgeOne / 自托管）
- [docs/security.md](docs/security.md) — 安全架构
- [docs/contributing.md](docs/contributing.md) — 贡献指南
- [openspec/](openspec/) — 架构、数据模型、UI 与功能规范

## 常见问题

**Q: 页面无法连接 Supabase？**
A: 确认 `.env.local` 中的 `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   已正确填写，且已运行 `supabase/schema.sql` 创建数据表。

**Q: 后台监控不更新？**
A: 默认部署依赖 Supabase Cron / Edge Functions 执行定时检查。请确认已在 Supabase
   侧配置定时任务。

## 获取帮助

- **Bug 报告 / 功能建议**：请在 GitHub 提交 Issue（使用对应模板）。
- **使用疑问**：可在 Issue 中描述，或在 Discussions（如已启用）中提问。
- **安全漏洞**：请勿公开提 Issue，请按 [SECURITY.md](SECURITY.md) 私下报告。

对于使用类问题，请在提交 Issue 前确认已阅读上述文档，并提供：

- 复现步骤
- 期望行为与实际行为
- 浏览器 / 运行环境信息
- 相关日志或截图
