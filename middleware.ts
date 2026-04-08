// middleware.ts v2.4.0
import createMiddleware from 'next-intl/middleware';

const locales = ['en', 'zh-cn', 'zh-tw', 'es', 'ar', 'fr', 'pt-BR', 'de', 'ja', 'ko', 'ru', 'vi', 'tr', 'th', 'sv', 'nl', 'pl', 'it', 'id', 'hi', 'cs'];

const middleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

export default middleware;

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|favicon.ico).*)'
  ]
};
