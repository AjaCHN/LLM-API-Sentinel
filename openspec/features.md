# Features Specification

## 2.0.0
- **Multi-Region Detection**: Built-in simulated detection logic for North America (NA), Europe (EU), and Asia (Asia) nodes, generating independent detection records for each region.
- **Alert Notification System**: Intelligent alert logic for downtime, availability degradation, and high latency. Integrates `nodemailer` for email notifications based on user preferences.
- **API Performance Metrics Deep Analysis**: Automatically pulls historical data from the past 7 days to calculate Average Latency, P95 Latency, and Average Throughput (RPS). Features a new `MetricsComparisonChart` for visual comparison.
- **Internationalization (i18n)**: Supports over 20 languages including English, Chinese, Spanish, Arabic, French, Portuguese, German, Japanese, Korean, and Russian.
- **Global API Coverage**: Added major AI providers from China (Moonshot, Zhipu, Baichuan, Alibaba, Tencent, Baidu) and US (Meta/Groq, Mistral).
- **Dark Mode**: Implemented full dark/light theme support with `next-themes`.
- **Responsive Design**: Optimized layout for desktop, tablet, and mobile devices.
- **GEO Info**: Added real-time geographic location detection for the monitoring node.
- **SEO Optimization**: Added comprehensive meta tags and OpenGraph support.
- **Semantic IDs**: Added unique IDs to all major containers for easier debugging.
- **Documentation**: Created bilingual README files (EN/CN).
