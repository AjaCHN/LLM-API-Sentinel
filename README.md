# LLM API Sentinel v2.2.0

[English](README.md) | [中文](README_CN.md)

Real-time monitoring and historical availability tracking for major LLM APIs worldwide.

## Features
- **Global Monitoring**: Tracks reachability and latency for AI providers in the US (OpenAI, Anthropic, Google, Meta/Groq, Mistral) and China (Moonshot, Zhipu, Baichuan, Alibaba, Tencent, Baidu).
- **Autonomous Monitoring**: Server-side background task performs API checks every 5 minutes without user intervention.
- **Historical Data**: Visualizes performance trends using interactive Area Charts.
- **Real-time Alerting**: Notification system for API downtime and high latency (>1500ms).
- **Alert Management**: Authenticated users can resolve active alerts.
- **Adaptive UI**: Fully responsive design with Dark/Light mode support.
- **Real-time Updates**: Powered by Firebase Firestore for instant status synchronization.
- **Secure Access**: Manual health checks are protected by Google Authentication.
- **GEO Info**: Real-time geographic location detection for the monitoring node.
- **Internationalization**: Multi-language support (ar, cs, en, es, hi, id, it, nl, pl, sv, th, tr, ru, vi, zh-cn, zh-tw).
- **SEO Optimization**: Comprehensive meta tags and OpenGraph support.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Server**: Express (for background tasks)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Firebase Admin**: For secure server-side Firestore updates
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Utility**: date-fns
- **Theming**: next-themes
- **Internationalization**: next-intl

## Getting Started
1. Configure your Firebase project in `firebase-applet-config.json`.
2. Deploy Firestore rules using `firestore.rules`.
3. Sign in to trigger manual health checks.

---

# LLM API Sentinel v2.2.0

[English](README.md) | [中文](README_CN.md)

全球主流大模型 API 实时监控与历史可用性追踪系统。

## 功能特性
- **全球监控**: 追踪美国（OpenAI, Anthropic, Google, Meta/Groq, Mistral）和中国（Moonshot, 智谱, 百川, 阿里, 腾讯, 百度）主流 AI 供应商的连通性与延迟。
- **自主监控**: 服务器端后台任务每 5 分钟自动执行 API 检查，无需用户干预。
- **历史数据**: 使用交互式面积图可视化性能趋势。
- **实时告警**: API 宕机和高延迟（>1500ms）的通知系统。
- **告警管理**: 认证用户可以解决活跃告警。
- **自适应 UI**: 全响应式设计，支持深色/浅色模式切换。
- **实时更新**: 基于 Firebase Firestore 实现状态即时同步。
- **安全访问**: 手动健康检查受 Google 身份验证保护。
- **地理信息**: 监控节点的实时地理位置检测。
- **国际化**: 多语言支持（ar, cs, en, es, hi, id, it, nl, pl, sv, th, tr, ru, vi, zh-cn, zh-tw）。
- **SEO 优化**: 全面的元标签和 OpenGraph 支持。

## 技术栈
- **框架**: Next.js 14 (App Router)
- **服务器**: Express (用于后台任务)
- **数据库**: Firebase Firestore
- **身份验证**: Firebase Authentication
- **Firebase Admin**: 用于安全的服务器端 Firestore 更新
- **样式**: Tailwind CSS 4
- **图表**: Recharts
- **图标**: Lucide React
- **日期工具**: date-fns
- **主题**: next-themes
- **国际化**: next-intl

## 快速开始
1. 在 `firebase-applet-config.json` 中配置您的 Firebase 项目。
2. 使用 `firestore.rules` 部署 Firestore 规则。
3. 登录以触发手动健康检查。
