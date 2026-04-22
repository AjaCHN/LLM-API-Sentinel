# LLM API Sentinel v2.4.3

[English](README.md) | [中文](README_CN.md)

Real-time monitoring and historical availability tracking for major LLM APIs worldwide.

## Features
- **Global Monitoring**: Tracks reachability and latency for AI providers in the US (OpenAI, Anthropic, Google, Meta, Mistral) and China (Moonshot/Kimi, ZhipuAI, Baichuan, Alibaba/Qwen, Tencent/Hunyuan, Baidu/Ernie, DeepSeek).
- **Historical Data**: Visualizes performance trends using interactive Area Charts.
- **Adaptive UI**: Fully responsive design with Dark/Light mode support.
- **Real-time Updates**: Powered by Firebase Firestore for instant status synchronization.
- **Secure Access**: Manual health checks are protected by Google Authentication.
- **Smart Alerts**: Automatic detection of API downtime and high latency with severity-based notifications.

## Tech Stack
- **Framework**: Next.js 14.2.13 (App Router)
- **Server**: Express 5.2.1
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Styling**: Tailwind CSS 4.1.11
- **Charts**: Recharts 3.8.0
- **Icons**: Lucide React

## Getting Started
1. Configure your Firebase project in `firebase-applet-config.json`.
2. Deploy Firestore rules using `firestore.rules`.
3. Sign in to trigger manual health checks.

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

## 技术栈
- **框架**: Next.js 14.2.13 (App Router)
- **服务器**: Express 5.2.1
- **数据库**: Firebase Firestore
- **身份验证**: Firebase Authentication
- **样式**: Tailwind CSS 4.1.11
- **图表**: Recharts 3.8.0
- **图标**: Lucide React

## 快速开始
1. 在 `firebase-applet-config.json` 中配置您的 Firebase 项目。
2. 使用 `firestore.rules` 部署 Firestore 规则。
3. 登录以触发手动健康检查。
