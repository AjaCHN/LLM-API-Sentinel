# LLM API Sentinel v2.5.1

[English](README.md) | [中文](README_CN.md)

Real-time monitoring and historical availability tracking for major LLM APIs worldwide.

## Features
- **Global Monitoring**: Tracks reachability and latency for AI providers in the US (OpenAI, Anthropic, Google, Meta, Mistral) and China (Moonshot/Kimi, ZhipuAI, Baichuan, Alibaba/Qwen, Tencent/Hunyuan, Baidu/Ernie, DeepSeek).
- **Historical Data**: Visualizes performance trends using interactive Area Charts.
- **Adaptive UI**: Fully responsive design with Dark/Light mode support.
- **Real-time Updates**: Powered by Firebase Firestore for instant status synchronization. No API routes required!
- **Secure Access**: Manual health checks are protected by Google Authentication.
- **Smart Alerts**: Automatic detection of API downtime and high latency with severity-based notifications.
- **Autonomous Monitoring**: Background tasks perform API checks every 5 minutes without user intervention.
- **Performance Optimizations**: 
  - Frontend: React.memo, useMemo, and limited chart data points for better performance
  - Backend: Concurrent request limiting, API check retry mechanism, and batch Firestore writes
- **Internationalization**: Support for 22 languages including English, Chinese, Spanish, Arabic, French, German, Japanese, and more.
- **Geographic Location**: Real-time detection of monitoring node location with 24-hour local caching.

## Tech Stack
- **Framework**: Next.js 14.2.13 (App Router, Static Export)
- **Backend**: Firebase Cloud Functions (Serverless)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (Google OAuth)
- **Styling**: Tailwind CSS 4.1.11
- **Charts**: Recharts 3.8.0
- **Icons**: Lucide React
- **Internationalization**: next-intl 4.8.3
- **Time Processing**: date-fns 4.1.0

## Architecture

This project uses a **Static Frontend + Firebase Backend** architecture:

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Next.js   │────▶│  Firebase FS    │◀────│ Cloud Functions│
│  (Static)   │     │  (Real-time)     │     │  (Monitor)     │
└─────────────┘     └──────────────────┘     └──────────────┘
```

- **Frontend**: Static export to `out/` directory, deployable to any static hosting
- **Real-time Data**: Firestore real-time listeners (no polling)
- **Backend**: Firebase Cloud Functions for scheduled API checks

## Getting Started
1. Configure your Firebase project in `firebase-applet-config.json`.
2. Deploy Firestore rules using `firestore.rules`.
3. Deploy Firebase Cloud Functions: `pnpm deploy:functions`
4. Sign in with Google to view monitoring dashboard.
5. The system will automatically perform background checks every 5 minutes.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions to:
- **腾讯云 EdgeOne Pages**
- **Vercel**
- **Firebase Hosting**
- **Firebase Cloud Functions**

## API Monitoring Configuration
- **Latency Threshold**: 1500ms
- **Max Retries**: 2
- **Retry Delay**: 1000ms
- **Max Concurrent Requests**: 5
- **Background Check Interval**: 5 minutes

## Supported APIs
### US Providers
- OpenAI GPT-4o
- Anthropic Claude 3.5
- Google Gemini 1.5
- Meta Llama 3 (Groq)
- Mistral Large

### China Providers
- Moonshot V1 (Kimi)
- Zhipu GLM-4
- Baichuan 2
- Qwen Max (Alibaba)
- Hunyuan (Tencent)
- Ernie 4.0 (Baidu)
- DeepSeek V3

---

# LLM API Sentinel v2.4.3

[English](README.md) | [中文](README_CN.md)

全球主流大模型 API 实时监控与历史可用性追踪系统。

## 功能特性
- **全球监控**: 追踪美国（OpenAI, Anthropic, Google, Meta, Mistral）和中国（Moonshot/Kimi, 智谱AI, 百川智能, 阿里巴巴/Qwen, 腾讯/混元, 百度/文心, 深度求索）主流 AI 供应商的连通性与延迟。
- **历史数据**: 使用交互式面积图可视化性能趋势。
- **自适应 UI**: 全响应式设计，支持深色/浅色模式切换。
- **实时更新**: 基于 Firebase Firestore 实现状态即时同步。
- **安全访问**: 手动健康检查受 Google 身份验证保护。
- **智能告警**: 自动检测 API 宕机和延迟过高，根据严重程度发送通知。
- **自主监控**: 后台任务每 5 分钟自动执行 API 检查，无需用户干预。
- **性能优化**: 
  - 前端: React.memo、useMemo 和限制图表数据点以提高性能
  - 后端: 并发请求限制、API 检查重试机制和批量 Firestore 写入
- **国际化**: 支持 22 种语言，包括英语、中文、西班牙语、阿拉伯语、法语、德语、日语等。
- **地理位置**: 实时检测监控节点位置，24 小时本地缓存。

## 技术栈
- **框架**: Next.js 14.2.13 (App Router)
- **服务器**: Express 5.2.1（用于后台任务）
- **数据库**: Firebase Firestore
- **身份验证**: Firebase Authentication（Google OAuth）
- **样式**: Tailwind CSS 4.1.11
- **图表**: Recharts 3.8.0
- **图标**: Lucide React
- **国际化**: next-intl 4.8.3
- **时间处理**: date-fns 4.1.0

## 快速开始
1. 在 `firebase-applet-config.json` 中配置您的 Firebase 项目。
2. 使用 `firestore.rules` 部署 Firestore 规则。
3. 使用 Google 登录以触发手动健康检查。
4. 系统将每 5 分钟自动执行后台检查。

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
