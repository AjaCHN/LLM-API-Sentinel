# LLM API Sentinel v2.6.1

[English](README.md) | [中文](README_CN.md)

全球主流大模型 API 实时监控与历史可用性追踪系统。

## 功能特性
- **全球监控**: 追踪美国（OpenAI, Anthropic, Google, Meta, Mistral）和中国（Moonshot/Kimi, 智谱AI, 百川智能, 阿里巴巴/Qwen, 腾讯/混元, 百度/文心, 深度求索）主流 AI 供应商的连通性与延迟。
- **历史数据**: 使用交互式面积图可视化性能趋势。
- **自适应 UI**: 全响应式设计，支持深色/浅色模式切换。
- **实时更新**: 基于 Firebase Firestore 实现状态即时同步。无需 API 路由！
- **安全访问**: 手动健康检查受 Google 身份验证保护。
- **智能告警**: 自动检测 API 宕机和延迟过高，根据严重程度发送通知。
- **自主监控**: 后台任务每 5 分钟自动执行 API 检查，无需用户干预。
- **性能优化**:
  - 前端: React.memo、useMemo 和限制图表数据点以提高性能
  - 后端: 并发请求限制、API 检查重试机制和批量 Firestore 写入
- **地理位置**: 实时检测监控节点位置，24 小时本地缓存。
- **缓存系统**: 多层缓存（内存 + localStorage + sessionStorage），智能过期计算。

## 技术栈
- **框架**: Next.js 14.2.13 (App Router, 静态导出)
- **后端**: Firebase Cloud Functions (无服务器)
- **数据库**: Firebase Firestore
- **身份验证**: Firebase Authentication
- **样式**: Tailwind CSS 4.1.11
- **图表**: Recharts 3.8.0
- **图标**: Lucide React
- **时间处理**: date-fns 4.1.0

## 架构设计

本项目采用**静态前端 + Firebase 后端**的架构：

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Next.js   │────▶│  Firebase FS     │◀────│ Cloud Functions│
│  (静态导出)  │     │  (实时监听)       │     │  (监控任务)   │
└─────────────┘     └──────────────────┘     └──────────────┘
```

- **前端**: 静态导出到 `out/` 目录，可部署到任何静态托管服务
- **实时数据**: Firestore 实时监听（无轮询）
- **后端**: Firebase Cloud Functions 用于定时 API 检查

## 快速开始

1. 在 `firebase-applet-config.json` 中配置您的 Firebase 项目。
2. 使用 `firestore.rules` 部署 Firestore 规则。
3. 部署 Firebase Cloud Functions：`pnpm deploy:functions`
4. 使用 Google 登录以查看监控仪表板。
5. 系统将每 5 分钟自动执行后台检查。

## 部署指南

详细部署说明请参阅 [DEPLOYMENT.md](DEPLOYMENT.md)：
- **腾讯云 EdgeOne Pages**
- **Vercel**
- **Firebase Hosting**
- **Firebase Cloud Functions**

## API 监控配置
- **延迟阈值**: 1500ms
- **最大重试次数**: 2
- **重试延迟**: 1000ms
- **最大并发请求**: 5
- **后台检查间隔**: 5 分钟

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
- Qwen Max (阿里巴巴)
- 混元 (腾讯)
- 文心 4.0 (百度)
- 深度求索 V3

## 许可证
MIT
