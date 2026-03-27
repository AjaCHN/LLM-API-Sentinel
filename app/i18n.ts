// app/i18n.ts v2.3.0
import { getRequestConfig } from 'next-intl/server';

// Always use default locale 'en'
export default getRequestConfig(async () => {
  const locale = 'en';
  
  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default
  };
});
