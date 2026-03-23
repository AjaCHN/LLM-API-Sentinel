# LLM API Sentinel v3.5.1

[English](README.md) | [中文](README_CN.md)

全球主流大模型 API 实时监控与历史可用性追踪系统。

## 功能特性
- **Logo 生成**: 内置 Logo 生成工具，使用 Gemini 3.1 Flash Image 为应用生成专业的 Logo 和 Favicon。访问 `/logo` 即可使用。
- **全球监控**: 追踪美国（OpenAI, Anthropic, Google）和中国（Kimi, 智谱, 百川）主流 AI 供应商的连通性与延迟。
- **多区域检测**: 内置北美 (NA)、欧洲 (EU) 和亚洲 (Asia) 节点的模拟检测逻辑，并为每个区域生成独立的检测记录。
- **告警通知系统**: 智能告警逻辑，支持宕机告警、可用性降级告警和高延迟告警。集成 `nodemailer`，根据用户偏好发送邮件通知。
- **API性能指标深度分析**: 自动拉取过去 7 天的历史数据，计算平均响应时间、峰值响应时间 (P95) 和平均吞吐量 (RPS)。新增 `MetricsComparisonChart` 进行直观对比。
- **国际化 (i18n)**: 支持超过 20 种语言，包括英语、中文、西班牙语、阿拉伯语、法语、葡萄牙语、德语、日语、韩语和俄语。
- **自定义策略**: 为每个 API 配置独立的检测间隔和策略（Ping 或完整请求）。
- **吞吐量追踪**: 计算并可视化 API 吞吐量（每秒请求数）及延迟。
- **历史数据**: 使用交互式面积图可视化性能趋势。
- **自适应 UI**: 全响应式设计，支持深色/浅色模式切换。
- **实时更新**: 基于 Firebase Firestore 实现状态即时同步。
- **安全访问**: 手动健康检查受 Google 身份验证保护。

## 技术栈
- **框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS 4
- **数据库**: Firebase Firestore
- **身份验证**: Firebase Authentication
- **图表**: Recharts
- **图标**: Lucide React
- **告警**: Nodemailer, Axios
- **国际化**: next-intl

## 快速开始
1. 通过环境变量配置您的 Firebase 项目和告警设置（参考 `.env.example`）。
2. 使用 `firestore.rules` 部署 Firestore 规则。
3. 登录以触发手动健康检查。
