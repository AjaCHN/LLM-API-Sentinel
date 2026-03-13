# LLM API Sentinel v2.1.0

[English](README.md) | [中文](README_CN.md)

Real-time monitoring and historical availability tracking for major LLM APIs worldwide.

## Features
- **Global Monitoring**: Tracks reachability and latency for AI providers in the US (OpenAI, Anthropic, Google) and China (Moonshot, Zhipu, Baichuan).
- **Custom Strategies**: Configure independent check intervals and strategies (ping vs full request) per API.
- **Throughput Tracking**: Calculates and visualizes API throughput (requests per second) alongside latency.
- **Alert System**: Sends automated alerts via Email and Enterprise WeChat when availability drops below 95%.
- **Historical Data**: Visualizes performance trends using interactive Area Charts.
- **Adaptive UI**: Fully responsive design with Dark/Light mode support.
- **Real-time Updates**: Powered by Firebase Firestore for instant status synchronization.
- **Secure Access**: Manual health checks are protected by Google Authentication.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Charts**: Recharts
- **Icons**: Lucide React
- **Alerts**: Nodemailer, Axios

## Getting Started
1. Configure your Firebase project and alert settings using environment variables (see `.env.example`).
2. Deploy Firestore rules using `firestore.rules`.
3. Sign in to trigger manual health checks.

---

# LLM API Sentinel v2.1.0

[English](README.md) | [中文](README_CN.md)

全球主流大模型 API 实时监控与历史可用性追踪系统。

## 功能特性
- **全球监控**: 追踪美国（OpenAI, Anthropic, Google）和中国（Kimi, 智谱, 百川）主流 AI 供应商的连通性与延迟。
- **自定义策略**: 为每个 API 配置独立的检测间隔和策略（Ping 或完整请求）。
- **吞吐量追踪**: 计算并可视化 API 吞吐量（每秒请求数）及延迟。
- **告警系统**: 当可用性低于 95% 时，自动通过邮件和企业微信发送告警。
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

## 快速开始
1. 通过环境变量配置您的 Firebase 项目和告警设置（参考 `.env.example`）。
2. 使用 `firestore.rules` 部署 Firestore 规则。
3. 登录以触发手动健康检查。
