// app/i18n.ts v2.3.0
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['ar', 'cs', 'en', 'es', 'hi', 'id', 'it', 'nl', 'pl', 'sv', 'th', 'tr', 'ru', 'vi', 'zh-cn', 'zh-tw'];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./locales/${locale}.json`)).default
  };
});
