// i18n/request.ts v3.4.7
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'zh-cn', 'zh-tw', 'es', 'ar'];

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
