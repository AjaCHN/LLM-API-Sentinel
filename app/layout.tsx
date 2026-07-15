// app/layout.tsx v2.7.0
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './style.css';
import { ThemeProvider } from './components/ThemeProvider';
import StructuredData from './components/StructuredData';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://llm-api-sentinel.vercel.app';

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
      'es': '/?lang=es',
      'ja': '/?lang=ja',
      'ko': '/?lang=ko',
      'ar': '/?lang=ar',
      'hi': '/?lang=hi',
      'vi': '/?lang=vi',
      'th': '/?lang=th',
      'id': '/?lang=id',
      'ru': '/?lang=ru',
      'tr': '/?lang=tr',
      'it': '/?lang=it',
      'nl': '/?lang=nl',
      'pl': '/?lang=pl',
      'cs': '/?lang=cs',
      'sv': '/?lang=sv',
    },
  },
  openGraph: {
    title: 'LLM API Sentinel | Global AI API Monitoring',
    description: 'Real-time monitoring for major LLM APIs. Track latency, uptime, and availability for OpenAI, Anthropic, Google, and Chinese AI providers.',
    url: SITE_URL,
    siteName: 'LLM API Sentinel',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_CN', 'zh_TW', 'es_ES', 'ja_JP', 'ko_KR'],
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
    google: 'google-site-verification-code',
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
    <html suppressHydrationWarning lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
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