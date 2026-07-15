// app/components/StructuredData.tsx v2.7.0

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://llm-api-sentinel.vercel.app';

export default function StructuredData() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LLM API Sentinel',
    url: SITE_URL,
    description: 'Real-time monitoring and historical availability tracking for major LLM APIs including OpenAI, Anthropic, Gemini, Kimi, DeepSeek and more.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['en', 'zh-CN', 'zh-TW', 'es', 'ja', 'ko', 'ar', 'hi', 'vi', 'th', 'id', 'ru', 'tr', 'it', 'nl', 'pl', 'cs', 'sv'],
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LLM API Sentinel',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      'https://github.com/sut',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'technical support',
      url: `${SITE_URL}/`,
    },
  };

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LLM API Sentinel',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Real-time monitoring dashboard for major LLM APIs. Track latency, uptime, and availability for OpenAI GPT-4, Anthropic Claude, Google Gemini, and Chinese AI providers.',
    screenshot: `${SITE_URL}/og-image.png`,
    featureList: [
      'Real-time API status monitoring',
      'Historical latency tracking',
      'Multi-provider support',
      'Alert notifications',
      'Responsive dashboard',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
    </>
  );
}