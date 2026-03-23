// i18n/request.ts v3.4.7
import { getRequestConfig } from 'next-intl/server';

const locales = ['ar', 'cs', 'de', 'en', 'es', 'fr', 'hi', 'id', 'it', 'ja', 'ko', 'nl', 'pl', 'pt-BR', 'ru', 'sv', 'th', 'tr', 'vi', 'zh-cn', 'zh-tw'];

export default getRequestConfig(async ({ locale }) => {
  if (!locale || !locales.includes(locale as any)) {
    return {
      locale: 'en',
      messages: (await import(`../app/locales/en.json`)).default
    };
  }

  return {
    locale: locale as string,
    messages: (await import(`../app/locales/${locale}.json`)).default
  };
});
