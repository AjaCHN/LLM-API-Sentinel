// app/lib/i18n.ts v2.9.3
// 安全加固: 添加 locale 白名单验证，防止 localStorage 篡改导致的异常
// 修复: 改用静态导入所有语言包，避免动态模板 import 在客户端打包失败导致
//       页面显示 i18n key 而非翻译字符串的问题

type TranslationData = { [section: string]: { [key: string]: string } };

import enData from '../locales/en.json';
import zhCnData from '../locales/zh-cn.json';
import zhTwData from '../locales/zh-tw.json';
import arData from '../locales/ar.json';
import csData from '../locales/cs.json';
import esData from '../locales/es.json';
import hiData from '../locales/hi.json';
import idData from '../locales/id.json';
import itData from '../locales/it.json';
import nlData from '../locales/nl.json';
import plData from '../locales/pl.json';
import svData from '../locales/sv.json';
import thData from '../locales/th.json';
import trData from '../locales/tr.json';
import ruData from '../locales/ru.json';
import viData from '../locales/vi.json';

const translations: Record<string, TranslationData> = {
  en: enData as TranslationData,
  'zh-CN': zhCnData as TranslationData,
  'zh-TW': zhTwData as TranslationData,
  ar: arData as TranslationData,
  cs: csData as TranslationData,
  es: esData as TranslationData,
  hi: hiData as TranslationData,
  id: idData as TranslationData,
  it: itData as TranslationData,
  nl: nlData as TranslationData,
  pl: plData as TranslationData,
  sv: svData as TranslationData,
  th: thData as TranslationData,
  tr: trData as TranslationData,
  ru: ruData as TranslationData,
  vi: viData as TranslationData,
};

let currentLocale = 'en';
const enFallback: TranslationData = enData as TranslationData;

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
  // 未知 locale 回退到 en
  currentLocale = 'en';
}

export function initLocaleSync(): void {
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
  if (isValidLocale(localeToUse) && translations[localeToUse]) {
    currentLocale = localeToUse;
  }
}

export function t(key: string): string {
  const keys = key.split('.');
  const data: unknown = translations[currentLocale];

  if (data && typeof data === 'object') {
    let value: unknown = data;
    let matched = true;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        matched = false;
        break;
      }
    }
    if (matched && typeof value === 'string') return value;
  }

  // 回退到英文
  if (currentLocale !== 'en') {
    const fb: unknown = enFallback;
    let value: unknown = fb;
    let matched = true;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        matched = false;
        break;
      }
    }
    if (matched && typeof value === 'string') return value;
  }

  return key;
}

export function formatMessage(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}
