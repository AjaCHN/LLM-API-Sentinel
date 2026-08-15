// app/sitemap.ts v2.9.8
import type { MetadataRoute } from 'next';

const isDev = process.env.NODE_ENV !== 'production';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (isDev ? 'http://localhost:3000' : 'https://llmapi.ewuse.com');

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
