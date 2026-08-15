// app/robots.ts v2.9.8
import type { MetadataRoute } from 'next';

const isDev = process.env.NODE_ENV !== 'production';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (isDev ? 'http://localhost:3000' : 'https://llmapi.ewuse.com');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
