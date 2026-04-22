# LLM API Sentinel v2.4.2

[English](README.md) | [中文](README_CN.md)

Real-time monitoring and historical availability tracking for major LLM APIs worldwide.

## Features
- **Global Monitoring**: Tracks reachability and latency for AI providers in the US (OpenAI, Anthropic, Google, Meta/Groq, Mistral) and China (Moonshot, Zhipu, Baichuan, Alibaba, Tencent, Baidu, DeepSeek).
- **Autonomous Monitoring**: Server-side background task performs API checks every 5 minutes without user intervention.
- **Historical Data**: Visualizes performance trends using interactive Area Charts.
- **Real-time Alerting**: Notification system for API downtime and high latency (>1500ms).
- **Alert Management**: Authenticated users can resolve active alerts.
- **Adaptive UI**: Fully responsive design with Dark/Light mode support.
- **Real-time Updates**: Powered by Firebase Firestore for instant status synchronization.
- **Secure Access**: Manual health checks are protected by authorization.
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
1. Configure your Firebase project in `firebase-applet-config.json` or use environment variables.
2. Deploy Firestore rules using `firestore.rules`.
3. Sign in to trigger manual health checks.

## Security
- API health check endpoint is protected by authorization
- Firebase configuration is securely loaded
- Production environment doesn't log sensitive information
