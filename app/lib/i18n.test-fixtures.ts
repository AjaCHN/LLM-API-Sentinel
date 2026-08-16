// app/lib/i18n.test-fixtures.ts v2.10.7
import en from '../locales/en.json';
import zhCn from '../locales/zh-cn.json';
import zhTw from '../locales/zh-tw.json';
import ar from '../locales/ar.json';
import cs from '../locales/cs.json';
import es from '../locales/es.json';
import hi from '../locales/hi.json';
import id from '../locales/id.json';
import itLocale from '../locales/it.json';
import nl from '../locales/nl.json';
import pl from '../locales/pl.json';
import ru from '../locales/ru.json';
import sv from '../locales/sv.json';
import th from '../locales/th.json';
import tr from '../locales/tr.json';
import vi from '../locales/vi.json';

/** 全部语言包（code -> 嵌套字典），供翻译完整性测试复用 */
export const allLocales: Record<string, Record<string, Record<string, string | string[]>>> = {
  en,
  'zh-CN': zhCn,
  'zh-TW': zhTw,
  ar,
  cs,
  es,
  hi,
  id,
  it: itLocale,
  nl,
  pl,
  ru,
  sv,
  th,
  tr,
  vi,
};

// 供测试用例直接引用英文/简中/繁中语言包
export { en, zhCn, zhTw };

/** 递归获取嵌套字典的所有扁平 key 路径 */
export function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}
