// middleware.ts v2.3.0
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ar', 'cs', 'en', 'es', 'hi', 'id', 'it', 'nl', 'pl', 'sv', 'th', 'tr', 'ru', 'vi', 'zh-cn', 'zh-tw'],
  defaultLocale: 'en'
});

export const config = {
  matcher: ['/', '/(ar|cs|en|es|hi|id|it|nl|pl|sv|th|tr|ru|vi|zh-cn|zh-tw)/:path*']
};
