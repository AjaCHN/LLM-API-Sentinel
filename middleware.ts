// middleware.ts v3.4.7
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'zh-cn', 'zh-tw', 'es', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
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
