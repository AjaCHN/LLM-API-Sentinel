// app/lib/i18n.ts v2.6.0
import en from '../locales/en.json';
import zhCN from '../locales/zh-cn.json';

type TranslationData = typeof en;

const translations: Record<string, TranslationData> = {
  en,
  'zh-CN': zhCN,
};

let currentLocale = 'en';

export function setLocale(locale: string): void {
  if (translations[locale]) {
    currentLocale = locale;
  }
}

export function getLocale(): string {
  return currentLocale;
}

export function detectLocale(): string {
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language;
    if (browserLang.startsWith('zh')) {
      return 'zh-CN';
    }
  }
  return 'en';
}

export function initLocale(): void {
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale && translations[savedLocale]) {
    currentLocale = savedLocale;
  } else {
    currentLocale = detectLocale();
  }
}

export function t(key: string): string {
  const keys = key.split('.');
  let value: unknown = translations[currentLocale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      const enValue: unknown = translations['en'];
      let fallback: unknown = enValue;
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = (fallback as Record<string, unknown>)[fk];
        } else {
          return key;
        }
      }
      return typeof fallback === 'string' ? fallback : key;
    }
  }

  return typeof value === 'string' ? value : key;
}

export function formatMessage(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}
