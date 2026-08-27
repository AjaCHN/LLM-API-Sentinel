// app/lib/i18n.ts v2.10.28
// i18n 编排层：状态管理与翻译取值。常量与校验逻辑分别抽离到 i18n-locales.ts / i18n-validation.ts。
// 安全加固: 添加 locale 白名单验证，防止 localStorage 篡改导致的异常。
// 修复: 改用静态导入所有语言包，避免动态模板 import 在客户端打包失败导致页面显示 i18n key 的问题。

import {
  translations,
  enFallback,
  supportedLocales,
} from './i18n-locales';
import {
  isValidLocale,
  getSafeLocaleFromStorage,
  langToLocale,
  resolveZhLocale,
} from './i18n-validation';

let currentLocale = 'en';

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
  if (langOnly === 'zh') {
    return resolveZhLocale(browserLangLower);
  }
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

/** 读取数组型翻译值（如 share.promos），非数组时返回空数组，便于随机选取等场景 */
export function tArray(key: string): string[] {
  const keys = key.split('.');
  const data: unknown = translations[currentLocale];
  if (data && typeof data === 'object') {
    let value: unknown = data;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return [];
      }
    }
    return Array.isArray(value) ? value.map(String) : [];
  }
  return [];
}

export function formatMessage(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}
