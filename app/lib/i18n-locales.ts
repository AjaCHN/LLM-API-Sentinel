// app/lib/i18n-locales.ts v2.10.28
// i18n 纯常量与映射表：语言包静态导入、translations 映射、supportedLocales 白名单。
// 从 i18n.ts 抽离，遵循单文件 ≤200 行规则。

type TranslationData = { [section: string]: { [key: string]: string | string[] } };

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

export type { TranslationData };

export const translations: Record<string, TranslationData> = {
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

export const enFallback: TranslationData = enData as TranslationData;

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
export const VALID_LOCALE_CODES = new Set<string>(supportedLocales.map((l) => l.code));
