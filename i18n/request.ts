// i18n/request.ts v3.1.0
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['ar', 'cs', 'en', 'es', 'hi', 'id', 'it', 'nl', 'pl', 'sv', 'th', 'tr', 'ru', 'vi', 'zh-cn', 'zh-tw'];

export default getRequestConfig(async ({ locale }) => {
  if (!locale || !locales.includes(locale as any)) notFound();

  return {
    locale: locale as string,
    messages: (await import(`../app/locales/${locale}.json`)).default
  };
});
