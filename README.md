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
- **Geographic Location**: Real-time detection of monitoring node location with 24-hour local caching.
- **Caching System**: Multi-layer caching (memory + localStorage + sessionStorage) with intelligent expiry calculation.

## Tech Stack
- **Framework**: Next.js 14.2.13 (App Router, Static Export)
- **Backend**: Firebase Cloud Functions (Serverless)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (Google OAuth)
- **Styling**: Tailwind CSS 4.1.11
- **Charts**: Recharts 3.8.0
- **Icons**: Lucide React
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

## License
MIT
