# LLM API Sentinel v3.5.1

[English](README.md) | [中文](README_CN.md)

Real-time monitoring and historical availability tracking for major LLM APIs worldwide.

## Features
- **Logo Generation**: Built-in utility to generate a professional application logo and favicon using Gemini 3.1 Flash Image. Available at `/logo`.
- **Global Monitoring**: Tracks reachability and latency for AI providers in the US (OpenAI, Anthropic, Google) and China (Moonshot, Zhipu, Baichuan).
- **Multi-Region Detection**: Built-in simulated detection logic for North America (NA), Europe (EU), and Asia (Asia) nodes, generating independent detection records for each region.
- **Alert Notification System**: Intelligent alert logic for downtime, availability degradation, and high latency. Integrates `nodemailer` for email notifications based on user preferences.
- **API Performance Metrics Deep Analysis**: Automatically pulls historical data from the past 7 days to calculate Average Latency, P95 Latency, and Average Throughput (RPS). Features a new `MetricsComparisonChart` for visual comparison.
- **Internationalization (i18n)**: Supports over 20 languages including English, Chinese, Spanish, Arabic, French, Portuguese, German, Japanese, Korean, and Russian.
- **Custom Strategies**: Configure independent check intervals and strategies (ping vs full request) per API.
- **Throughput Tracking**: Calculates and visualizes API throughput (requests per second) alongside latency.
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
- **i18n**: next-intl

## Getting Started
1. Configure your Firebase project and alert settings using environment variables (see `.env.example`).
2. Deploy Firestore rules using `firestore.rules`.
3. Sign in to trigger manual health checks.
