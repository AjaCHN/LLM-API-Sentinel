# LLM API Sentinel v2.6.3

[English](README.md) | [中文](README_CN.md)

Real-time monitoring and historical availability tracking for major LLM APIs worldwide.

## Features
- **Global Monitoring**: Tracks reachability and latency for AI providers in the US (OpenAI, Anthropic, Google, Meta, Mistral) and China (Moonshot/Kimi, ZhipuAI, Baichuan, Alibaba/Qwen, Tencent/Hunyuan, Baidu/Ernie, DeepSeek).
- **Historical Data**: Visualizes performance trends using interactive Area Charts.
- **Adaptive UI**: Fully responsive design with Dark/Light mode support.
- **Real-time Updates**: Powered by Supabase Realtime for instant status synchronization.
- **Secure Access**: Manual health checks are protected by Google Authentication.
- **Smart Alerts**: Automatic detection of API downtime and high latency with severity-based notifications.
- **Autonomous Monitoring**: Background tasks perform API checks every 5 minutes without user intervention.
- **Performance Optimizations**:
  - Frontend: React.memo, useMemo, and limited chart data points for better performance
  - Backend: Concurrent request limiting, API check retry mechanism, and batch database writes
- **Geographic Location**: Real-time detection of monitoring node location with 24-hour local caching.
- **Caching System**: Multi-layer caching (memory + localStorage) with intelligent expiry calculation.
- **Internationalization**: Full i18n support with 16 languages (en, zh-cn, zh-tw, ar, cs, es, hi, id, it, nl, pl, sv, th, tr, ru, vi).
- **Multi-language**: Automatic browser language detection and manual language switching.

## Tech Stack
- **Framework**: Next.js 14.2.13 (App Router, Static Export)
- **Backend**: Express 5.2.1 (Custom Server)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth (Google OAuth)
- **Real-time**: Supabase Realtime
- **Styling**: Tailwind CSS 4.1.11
- **Charts**: Recharts 3.8.0
- **Icons**: Lucide React
- **State Management**: Zustand 5.0.12
- **Time Processing**: date-fns 4.1.0

## Architecture

This project uses a **Static Frontend + Supabase Backend** architecture:

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Next.js   │────▶│    Supabase      │◀────│   Express    │
│  (Static)   │     │  (PostgreSQL +   │     │  (Background)│
│             │     │   Realtime)      │     │   Server     │
└─────────────┘     └──────────────────┘     └──────────────┘
```

- **Frontend**: Static export to `out/` directory, deployable to any static hosting
- **Real-time Data**: Supabase Realtime subscriptions (no polling)
- **Backend**: Express server for scheduled API checks
- **Authentication**: Supabase Auth with Google OAuth

## Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account (or self-hosted Supabase)
- Google OAuth credentials

### Environment Setup

1. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. Set up the database:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase/schema.sql`
   - Enable Google OAuth in Supabase Auth settings

3. Install dependencies:

```bash
npm install
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

### Deployment

The project can be deployed to various static hosting platforms:项目可部署到多种静态托管平台：
- **腾讯云 EdgeOne Pages**
- **Vercel**
- **Netlify**

For Express server deployment:
```bash
npm run build
npm start
```

## API Monitoring Configuration
- **Latency Threshold**: 1500ms
- **Degraded Threshold**: 1000ms
- **Max Retries**: 2
- **Retry Delay**: 1000ms
- **Max Concurrent Requests**: 5
- **Background Check Interval**: 5 minutes
- **Cache Expiry**: 30 seconds (default)

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

## Internationalization

Supported languages:
- English (en)
- 简体中文 (zh-cn)
- 繁體中文 (zh-tw)
- العربية (ar)
- Čeština (cs)
- Español (es)
- हिन्दी (hi)
- Bahasa Indonesia (id)
- Italiano (it)
- Nederlands (nl)
- Polski (pl)
- Svenska (sv)
- ไทย (th)
- Türkçe (tr)
- Русский (ru)
- Tiếng Việt (vi)

## Project Structure

```
├── app/
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and core logic
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript type definitions
│   ├── constants/       # Application constants
│   ├── locales/         # i18n translation files
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main dashboard page
├── openspec/            # Project specification documents
├── supabase/            # Database schema
└── package.json
```

## License

MIT
