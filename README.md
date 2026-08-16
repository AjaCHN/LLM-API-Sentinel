# LLM API Sentinel v2.10.11

[English](README.md) | [中文](README_CN.md)

Real-time monitoring and historical availability tracking for major LLM APIs worldwide.

## Design System
- **Theme**: Deep dark-only immersive theme (two intensity levels) with indigo (#6366f1) + violet (#8b5cf6) gradient accents
- **Components**: shadcn/ui (Card, Button, Alert, Badge, Avatar, Dialog, Input, Popover, Tooltip, Separator, Skeleton, DropdownMenu, Label)
- **Visuals**: 3-layer radial-gradient background, status-dot pulse indicators, fade-in-up entrance animations
- **Responsive**: 1/2/3/4-column grid (sm/md/lg/xl breakpoints)
- **Prototype**: See `prototype/prototype.html` (open in browser directly)

## Features
- **Global Monitoring**: Tracks reachability and latency for 12 AI providers in the US (OpenAI, Anthropic, Google, Meta, Mistral) and China (Moonshot/Kimi, ZhipuAI, Baichuan, Alibaba/Qwen, Tencent/Hunyuan, Baidu/Ernie, DeepSeek).
- **Historical Data**: Visualizes performance trends using hand-written SVG area charts (zero charting dependency, 50 data points limit; Recharts available as a drop-in alternative).
- **Adaptive UI**: Fully responsive design (1/2/3/4 columns) with a deep dark-only immersive theme (two intensity levels via `.dark` class).
- **Real-time Updates**: Powered by Supabase Realtime for instant status synchronization (5-minute interval).
- **Secure Access**: Manual health checks are protected by Google Authentication (Supabase Auth).
- **Security Hardening**: Optional custom server (`server.ts`) adds Helmet security headers and per-IP rate limiting for manual checks.
- **Smart Alerts**: Automatic detection of API downtime (offline), degraded state, and high latency (threshold: 1500ms) with severity-based notifications.
- **Autonomous Monitoring**: Background tasks perform API checks every 5 minutes without user intervention.
- **Performance Optimizations**:
  - Frontend: React.memo, useMemo, and limited chart data points (50) for better performance
  - Backend: Concurrent request limiting (max 5), API check retry mechanism (2 retries), and batch database writes
- **Geographic Location**: Real-time detection of monitoring node location with 24-hour local caching.
- **Caching System**: Multi-layer caching (memory + localStorage, default 30s, range 5s-1min) with intelligent expiry calculation.
- **Internationalization**: Full i18n support with 16 languages (en, zh-cn, zh-tw, ar, cs, es, hi, id, it, nl, pl, sv, th, tr, ru, vi).
- **Multi-language**: Automatic browser language detection and manual language switching.

## Tech Stack
- **Framework**: Next.js 14.2.13 (App Router, Static Export)
- **Optional Server**: Express 5.2.1 + Helmet (Custom security server, opt-in)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth (Google OAuth)
- **Real-time**: Supabase Realtime
- **Styling**: Tailwind CSS 4.1.11 + shadcn/ui component library
- **Charts**: Hand-written SVG (zero-dependency); Recharts available as optional replacement
- **Icons**: Lucide React
- **State Management**: Zustand 5.0.12
- **Time Processing**: date-fns 4.1.0

## Architecture

This project uses a **Static Frontend + Supabase Backend** architecture. By default the app is statically exported to `out/` and served from static hosting (Vercel / EdgeOne Pages / Netlify), so **no custom server is required** for the frontend.

```
┌──────────────────┐     ┌──────────────────┐
│  Static Hosting  │────▶│    Supabase      │
│  (out/ export)   │     │  (PostgreSQL +   │
│                  │     │   Realtime)      │
└──────────────────┘     └──────────────────┘
         ▲                        ▲
         │            ┌──────────┴──────────┐
         │            │  Express (optional) │
         │            │  server.ts — manual │
         │            │  checks + security  │
         └────────────┘  headers/rate-limit │
                      └─────────────────────┘
```

- **Frontend**: Static export to `out/` directory, deployable to any static hosting
- **Real-time Data**: Supabase Realtime subscriptions (no polling)
- **Backend**: Autonomous background monitoring runs via Supabase (scheduled functions / edge workers). `server.ts` is an opt-in Express server that wraps Next.js to add Helmet security headers and per-IP rate limiting for manual checks — useful for self-hosted `node server.ts` deployments.
- **Authentication**: Supabase Auth with Google OAuth

## Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account (or self-hosted Supabase)
- Google OAuth credentials

### Environment Setup

1. Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> See [docs/env.md](docs/env.md) for the full variable reference. Firebase configuration is deprecated and kept for migration reference only.

2. Set up the database:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase/schema.sql`
   - Enable Google OAuth in Supabase Auth settings
   - (Optional) Set up scheduled background monitoring via Supabase Cron / Edge Functions

3. Install dependencies (this project uses `pnpm`):

```bash
pnpm install
```

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

### Deployment

The project is configured for **static export** (`output: 'export'` in `next.config.mjs`) and can be deployed to various static hosting platforms:
- **腾讯云 EdgeOne Pages** (see `edgeone.config.js`)
- **Vercel** (see `vercel.json`)
- **Netlify**

Build and deploy:
```bash
pnpm build   # outputs static files to out/
```

> For a self-hosted deployment with extra security hardening (Helmet headers + per-IP rate limiting), run the optional Express server instead of `next start`:
> ```bash
> pnpm build
> node server.ts
> ```
> Note: `server.ts` wraps Next.js in custom-server mode and is **not compatible** with static export — use one path or the other.

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
│   ├── components/       # React components (UI + dashboard widgets)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and core logic (monitor, geo, fetcher...)
│   ├── store/           # Zustand state management (api/auth/alerts/geo/error)
│   ├── types/           # TypeScript type definitions
│   ├── constants/       # Application constants (thresholds, default APIs)
│   ├── locales/         # i18n translation files (16 languages)
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main dashboard page
├── openspec/            # Project specification documents (architecture, data, ui...)
├── docs/                # Supplementary docs (env, deployment, security, contributing)
├── supabase/            # Database schema (schema.sql)
├── server.ts            # Optional Express security server (Helmet + rate limit)
├── next.config.mjs      # Next.js config (static export)
├── vercel.json          # Vercel deployment config
├── edgeone.config.js    # EdgeOne Pages deployment config
└── package.json
```

## Documentation

- [openspec/](openspec/) — Architecture, data model, UI, features, and change proposals
- [docs/env.md](docs/env.md) — Environment variables reference
- [docs/deployment.md](docs/deployment.md) — Deployment guide (Vercel / EdgeOne / self-host)
- [docs/security.md](docs/security.md) — Security architecture and best practices
- [docs/contributing.md](docs/contributing.md) — Contribution guidelines
- [docs/roadmap.md](docs/roadmap.md) — Roadmap & improvement proposals

## License

MIT
