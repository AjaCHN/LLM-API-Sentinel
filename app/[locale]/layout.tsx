// app/[locale]/layout.tsx v3.4.7
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'LLM API Sentinel v3.4.7 | Global AI API Monitoring',
  description: 'Real-time monitoring and historical availability tracking for major LLM APIs including OpenAI, Anthropic, Gemini, Kimi, and more.',
  keywords: ['LLM', 'API Monitoring', 'AI Status', 'OpenAI', 'Gemini', 'Claude', 'Kimi', 'DeepSeek'],
  authors: [{ name: 'Sut' }],
  openGraph: {
    title: 'LLM API Sentinel',
    description: 'Monitor global AI API health in real-time.',
    type: 'website',
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

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
