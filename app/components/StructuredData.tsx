// app/components/StructuredData.tsx v2.7.2
// 安全修复: 对 JSON-LD 内容进行安全转义，防止 XSS 攻击
// 原因: JSON.stringify 不会转义 </script> 等危险字符，直接注入 script 标签可能导致 XSS
// 安全改进: SITE_URL 默认值使用 localhost 而非生产域名，防止开发环境配置错误

const isDev = process.env.NODE_ENV !== 'production';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (isDev ? 'http://localhost:3000' : 'https://llm-api-sentinel.vercel.app');

/**
 * 安全转义 JSON 字符串以用于内联 script 标签
 * 防止 XSS 攻击：转义 < > / 等特殊字符
 * 参考 OWASP XSS 防护指南
 */
function escapeJsonForScriptTag(json: string): string {
  return json
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/\//g, '\\u002F');
}

/**
 * 安全地将对象序列化为可注入 script 标签的 JSON 字符串
 */
function safeJsonLd(schema: unknown): string {
  const json = JSON.stringify(schema);
  return escapeJsonForScriptTag(json);
}

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
    inLanguage: ['en', 'zh-CN', 'zh-TW', 'ar', 'cs', 'es', 'hi', 'id', 'it', 'nl', 'pl', 'ru', 'sv', 'th', 'tr', 'vi'],
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
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(softwareApplicationSchema) }}
      />
    </>
  );
}