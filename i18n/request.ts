// i18n/request.ts v3.1.1
import { getRequestConfig } from 'next-intl/server';

const locales = ['ar', 'cs', 'en', 'es', 'hi', 'id', 'it', 'nl', 'pl', 'sv', 'th', 'tr', 'ru', 'vi', 'zh-cn', 'zh-tw'];

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
