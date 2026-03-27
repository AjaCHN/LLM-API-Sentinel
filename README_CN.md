# LLM API Sentinel v2.0.0

[English](README.md) | [中文](README_CN.md)

全球主流大模型 API 实时监控与历史可用性追踪系统。

## 功能特性
- **全球监控**: 追踪美国（OpenAI, Anthropic, Google）和中国（Kimi, 智谱, 百川）主流 AI 供应商的连通性与延迟。
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

## 快速开始
1. 在 `firebase-applet-config.json` 中配置您的 Firebase 项目。
2. 使用 `firestore.rules` 部署 Firestore 规则。
3. 登录以触发手动健康检查。
