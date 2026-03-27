import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'zh-cn', 'zh-tw', 'es', 'ar', 'fr', 'pt-BR', 'de', 'ja', 'ko', 'ru'];

export default getRequestConfig(async ({ locale = 'en' }) => {
  const validLocale = locales.includes(locale) ? locale : 'en';

  return {
    locale: validLocale,
    messages: (await import(`./locales/${validLocale}.json`)).default
  };
});