// app/layout.tsx v2.10.33
// 安全改进: SITE_URL 默认值使用 localhost 而非生产域名，防止开发环境配置错误
// 字体策略: 不依赖运行时网络拉取，改用 style.css 中定义的系统字体栈（--font-sans / --font-mono）
import type { Metadata, Viewport } from 'next';
import './style.css';
import { ThemeProvider } from './components/ThemeProvider';
import StructuredData from './components/StructuredData';

const isDev = process.env.NODE_ENV !== 'production';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (isDev ? 'http://localhost:3000' : 'https://llmapi.ewuse.com');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'LLM API Sentinel | Global AI API Monitoring',
    template: '%s | LLM API Sentinel',
  },
  description: 'Real-time monitoring and historical availability tracking for major LLM APIs including OpenAI, Anthropic, Gemini, Kimi, DeepSeek and more. Monitor latency, uptime, and status for 12+ AI providers.',
  keywords: ['LLM', 'API Monitoring', 'AI Status', 'OpenAI', 'Gemini', 'Claude', 'Kimi', 'DeepSeek', 'API Health', 'Latency Monitoring', 'AI API Status'],
  authors: [{ name: 'Sut' }],
  creator: 'Sut',
  publisher: 'LLM API Sentinel',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
    languages: {
      'en': '/?lang=en',
      'zh-CN': '/?lang=zh-CN',
      'zh-TW': '/?lang=zh-TW',
      'ar': '/?lang=ar',
      'cs': '/?lang=cs',
      'es': '/?lang=es',
      'hi': '/?lang=hi',
      'id': '/?lang=id',
      'it': '/?lang=it',
      'nl': '/?lang=nl',
      'pl': '/?lang=pl',
      'ru': '/?lang=ru',
      'sv': '/?lang=sv',
      'th': '/?lang=th',
      'tr': '/?lang=tr',
      'vi': '/?lang=vi',
    },
  },
  openGraph: {
    title: 'LLM API Sentinel | Global AI API Monitoring',
    description: 'Real-time monitoring for major LLM APIs. Track latency, uptime, and availability for OpenAI, Anthropic, Google, and Chinese AI providers.',
    url: SITE_URL,
    siteName: 'LLM API Sentinel',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_CN', 'zh_TW', 'es_ES', 'ar_AR', 'cs_CZ', 'hi_IN', 'id_ID', 'it_IT', 'nl_NL', 'pl_PL', 'ru_RU', 'sv_SE', 'th_TH', 'tr_TR', 'vi_VN'],
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LLM API Sentinel Dashboard - Real-time AI API Monitoring',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLM API Sentinel | Global AI API Monitoring',
    description: 'Real-time monitoring for major LLM APIs. Track latency, uptime, and availability.',
    images: ['/og-image.png'],
    creator: '@llm_api_sentinel',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E4E3E0' },
    { media: '(prefers-color-scheme: dark)', color: '#0C0C0C' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co'}
          crossOrigin="anonymous"
        />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <StructuredData />
        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-0WKWY6YELE" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0WKWY6YELE');
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}