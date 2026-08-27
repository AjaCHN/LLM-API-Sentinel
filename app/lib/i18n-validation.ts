// app/lib/i18n-validation.ts v2.10.28
// i18n 安全校验与 localStorage 安全读取。从 i18n.ts 抽离，遵循单文件 ≤200 行规则。

import { VALID_LOCALE_CODES } from './i18n-locales';

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
export function getSafeLocaleFromStorage(): string {
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

// 浏览器语言 → 项目 locale 的映射（仅取主语言段时回退）
export const langToLocale: Record<string, string> = {
  zh: 'zh-CN',
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

// 特殊处理：zh 需区分简繁（基于原始浏览器语言串判断）
export function resolveZhLocale(browserLangLower: string): string {
  return browserLangLower.includes('tw') || browserLangLower.includes('hant') ? 'zh-TW' : 'zh-CN';
}
