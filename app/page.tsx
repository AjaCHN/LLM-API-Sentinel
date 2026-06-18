import { Suspense } from 'react';
import DashboardClient from './components/DashboardClient';
import DashboardSkeleton from './components/DashboardSkeleton';

// LLM API Sentinel — Home page (Server Component)
// Keeping page.tsx as a server component reduces initial JS bundle and unlocks streaming.
export const metadata = {
  title: 'LLM API Sentinel | Global AI API Monitoring',
  description: 'Real-time monitoring and historical availability tracking for major LLM APIs including OpenAI, Anthropic, Gemini, Kimi, DeepSeek and more.',
};

export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient />
    </Suspense>
  );
}
