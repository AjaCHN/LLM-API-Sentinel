// middleware.ts v3.4.7
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ar', 'cs', 'de', 'en', 'es', 'fr', 'hi', 'id', 'it', 'ja', 'ko', 'nl', 'pl', 'pt-BR', 'ru', 'sv', 'th', 'tr', 'vi', 'zh-cn', 'zh-tw'],
  defaultLocale: 'en',
  localePrefix: 'never'
});

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_static (inside /public)
    // - all root files inside /public (e.g. /favicon.ico)
    '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)'
  ]
};
