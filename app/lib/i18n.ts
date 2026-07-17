// app/lib/i18n.ts v2.7.1
// 安全加固: 添加 locale 白名单验证，防止 localStorage 篡改导致的异常

type TranslationData = { [section: string]: { [key: string]: string } };
const translations: Record<string, TranslationData> = {};

let currentLocale = 'en';
let enFallback: TranslationData | null = null;

const enInlineFallback: TranslationData = {
  dashboard: { title: 'LLM API Sentinel' },
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

// 安全: 有效的 locale 代码白名单（从 supportedLocales 生成）
const VALID_LOCALE_CODES = new Set<string>(supportedLocales.map((l) => l.code));

/**
 * 安全验证 locale 字符串是否在白名单中
 * 防止 localStorage 被篡改导致加载恶意 locale
 */
export function isValidLocale(locale: unknown): locale is string {
  return typeof locale === 'string' && VALID_LOCALE_CODES.has(locale);
}

/**
 * 安全地从 localStorage 读取 locale，失败则返回默认值
 */
function getSafeLocaleFromStorage(): string {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem('locale');
    if (isValidLocale(saved)) {
      return saved;
    }
    // 无效值则清除
    if (saved !== null) {
      localStorage.removeItem('locale');
    }
    return 'en';
  } catch {
    return 'en';
  }
}

export async function loadLocale(locale: string): Promise<void> {
  if (translations[locale]) {
    currentLocale = locale;
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const mod = await import(`../locales/${locale}.json`);
    translations[locale] = mod.default as TranslationData;
    if (locale === 'en') {
      enFallback = mod.default as TranslationData;
    }
    currentLocale = locale;
  } catch {
    if (locale !== 'en' && translations['en']) {
      currentLocale = 'en';
    }
  }
}

export function initLocaleSync(): void {
  if (!translations['en']) {
    translations['en'] = enInlineFallback;
  }
  if (!enFallback) {
    enFallback = enInlineFallback;
  }
  currentLocale = 'en';
}

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

  const availableCodes = supportedLocales.map((l) => l.code);
  const lowerToCode: Record<string, string> = {};
  for (const code of availableCodes) {
    lowerToCode[code.toLowerCase()] = code;
  }

  if (lowerToCode[browserLangLower]) {
    return lowerToCode[browserLangLower];
  }

  const langOnly = browserLangLower.split('-')[0];

  const langToLocale: Record<string, string> = {
    zh: browserLangLower.includes('tw') || browserLangLower.includes('hant') ? 'zh-TW' : 'zh-CN',
    en: 'en',
    ar: 'ar',
    cs: 'cs',
    es: 'es',
    hi: 'hi',
    id: 'id',
    it: 'it',
    nl: 'nl',
    pl: 'pl',
    sv: 'sv',
    th: 'th',
    tr: 'tr',
    ru: 'ru',
    vi: 'vi',
  };

  return langToLocale[langOnly] || 'en';
}

export function detectLocale(): string {
  return detectBrowserLocale();
}

export function initLocale(): void {
  initLocaleSync();
  if (typeof window === 'undefined') return;

  // 安全: 使用验证过的 localStorage 值
  const savedLocale = getSafeLocaleFromStorage();
  const localeToUse = savedLocale !== 'en' ? savedLocale : detectLocale();
  void loadLocale(isValidLocale(localeToUse) ? localeToUse : 'en');
}

export function t(key: string): string {
  const keys = key.split('.');
  let value: unknown = translations[currentLocale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      const fallback: unknown = enFallback || translations['en'];
      let fb: unknown = fallback;
      for (const fk of keys) {
        if (fb && typeof fb === 'object' && fk in fb) {
          fb = (fb as Record<string, unknown>)[fk];
        } else {
          return key;
        }
      }
      return typeof fb === 'string' ? fb : key;
    }
  }

  return typeof value === 'string' ? value : key;
}

export function formatMessage(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}
