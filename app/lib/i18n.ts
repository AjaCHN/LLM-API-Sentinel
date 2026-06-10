// app/lib/i18n.ts v2.6.3
import en from '../locales/en.json';
import zhCN from '../locales/zh-cn.json';
import zhTW from '../locales/zh-tw.json';
import ar from '../locales/ar.json';
import cs from '../locales/cs.json';
import es from '../locales/es.json';
import hi from '../locales/hi.json';
import id from '../locales/id.json';
import it from '../locales/it.json';
import nl from '../locales/nl.json';
import pl from '../locales/pl.json';
import sv from '../locales/sv.json';
import th from '../locales/th.json';
import tr from '../locales/tr.json';
import ru from '../locales/ru.json';
import vi from '../locales/vi.json';

type TranslationData = typeof en;

const translations: Record<string, TranslationData> = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  ar,
  cs,
  es,
  hi,
  id,
  it,
  nl,
  pl,
  sv,
  th,
  tr,
  ru,
  vi,
};

export const supportedLocales = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
] as const;

let currentLocale = 'en';

export function setLocale(locale: string): void {
  if (translations[locale]) {
    currentLocale = locale;
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale);
    }
  }
}

export function getLocale(): string {
  return currentLocale;
}

export function detectBrowserLocale(): string {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language || 'en';
  const browserLangLower = browserLang.toLowerCase();
  
  // Direct match
  if (translations[browserLangLower]) {
    return browserLangLower;
  }
  
  // Check for locale without region (e.g., 'zh' from 'zh-CN')
  const langOnly = browserLangLower.split('-')[0];
  
  // Language code mapping
  const langToLocale: Record<string, string> = {
    'zh': browserLangLower.includes('tw') || browserLangLower.includes('hant') ? 'zh-TW' : 'zh-CN',
    'en': 'en',
    'ar': 'ar',
    'cs': 'cs',
    'es': 'es',
    'hi': 'hi',
    'id': 'id',
    'it': 'it',
    'nl': 'nl',
    'pl': 'pl',
    'sv': 'sv',
    'th': 'th',
    'tr': 'tr',
    'ru': 'ru',
    'vi': 'vi',
  };
  
  return langToLocale[langOnly] || 'en';
}

export function detectLocale(): string {
  return detectBrowserLocale();
}

export function initLocale(): void {
  if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && translations[savedLocale]) {
      currentLocale = savedLocale;
    } else {
      currentLocale = detectLocale();
    }
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
