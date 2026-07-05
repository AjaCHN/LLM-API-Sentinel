// app/lib/i18n.test.ts v2.6.3

import { supportedLocales, initLocaleSync, getLocale, setLocale, t } from './i18n';

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

const allLocales: Record<string, Record<string, Record<string, string>>> = {
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

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
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

describe('i18n', () => {
  beforeEach(() => {
    initLocaleSync();
  });

  describe('supportedLocales', () => {
    it('should have 16 supported languages', () => {
      expect(supportedLocales).toHaveLength(16);
    });

    it('should have required properties for each locale', () => {
      supportedLocales.forEach((locale) => {
        expect(locale).toHaveProperty('code');
        expect(locale).toHaveProperty('name');
        expect(locale).toHaveProperty('nativeName');
        expect(typeof locale.code).toBe('string');
        expect(typeof locale.name).toBe('string');
        expect(typeof locale.nativeName).toBe('string');
      });
    });

    it('should have unique locale codes', () => {
      const codes = supportedLocales.map((l) => l.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });

  describe('locale files', () => {
    it('should have locale files for all supported locales', () => {
      supportedLocales.forEach((locale) => {
        const code = locale.code.toLowerCase();
        expect(allLocales[locale.code] || allLocales[code]).toBeDefined();
      });
    });

    it('should have all required sections in every locale', () => {
      const requiredSections = ['dashboard', 'api', 'alerts', 'config', 'errors', 'general', 'history', 'footer', 'geo'];

      Object.entries(allLocales).forEach(([_localeCode, localeData]) => {
        requiredSections.forEach((section) => {
          expect(localeData).toHaveProperty(section);
          expect(typeof localeData[section]).toBe('object');
        });
      });
    });

    describe('api section - newly added keys', () => {
      const newApiKeys = ['apis', 'other', 'timeout', 'times'] as const;

      it('should have all new api keys in English locale', () => {
        newApiKeys.forEach((key) => {
          expect(en.api).toHaveProperty(key);
          expect(typeof en.api[key]).toBe('string');
          expect(en.api[key].length).toBeGreaterThan(0);
        });
      });

      it('should have all new api keys in Simplified Chinese locale', () => {
        newApiKeys.forEach((key) => {
          expect(zhCn.api).toHaveProperty(key);
          expect(typeof zhCn.api[key]).toBe('string');
          expect(zhCn.api[key].length).toBeGreaterThan(0);
        });
      });

      it('should have all new api keys in Traditional Chinese locale', () => {
        newApiKeys.forEach((key) => {
          expect(zhTw.api).toHaveProperty(key);
          expect(typeof zhTw.api[key]).toBe('string');
          expect(zhTw.api[key].length).toBeGreaterThan(0);
        });
      });

      it('should have all new api keys in all locales', () => {
        Object.entries(allLocales).forEach(([_localeCode, localeData]) => {
          newApiKeys.forEach((key) => {
            const apiObj = localeData.api as Record<string, string>;
            expect(apiObj).toHaveProperty(key);
            expect(typeof apiObj[key]).toBe('string');
            expect(apiObj[key].length).toBeGreaterThan(0);
          });
        });
      });
    });

    describe('translation key completeness', () => {
      it('should have the same number of api keys across all locales', () => {
        const enApiKeyCount = Object.keys(en.api).length;

        Object.entries(allLocales).forEach(([_localeCode, localeData]) => {
          expect(Object.keys(localeData.api).length).toBe(enApiKeyCount);
        });
      });

      it('should have all English keys present in all locales', () => {
        const enKeys = getAllKeys(en);

        Object.entries(allLocales).forEach(([_localeCode, localeData]) => {
          const localeKeys = getAllKeys(localeData);
          const localeKeySet = new Set(localeKeys);

          enKeys.forEach((key) => {
            expect(localeKeySet.has(key)).toBe(true);
          });
        });
      });

      it('should not have empty string values for new api keys', () => {
        Object.entries(allLocales).forEach(([_localeCode, localeData]) => {
          expect(localeData.api.apis).not.toBe('');
          expect(localeData.api.other).not.toBe('');
          expect(localeData.api.timeout).not.toBe('');
          expect(localeData.api.times).not.toBe('');
        });
      });
    });
  });

  describe('initLocaleSync', () => {
    it('should initialize with English locale', () => {
      initLocaleSync();
      expect(getLocale()).toBe('en');
    });
  });

  describe('t function', () => {
    beforeEach(() => {
      initLocaleSync();
    });

    it('should return the key itself when translation not found', () => {
      const result = t('nonexistent.key');
      expect(result).toBe('nonexistent.key');
    });

    it('should return dashboard.title in English', () => {
      const result = t('dashboard.title');
      expect(result).toBe('LLM API Sentinel');
    });
  });

  describe('getLocale / setLocale', () => {
    beforeEach(() => {
      initLocaleSync();
    });

    it('should return en as default locale', () => {
      expect(getLocale()).toBe('en');
    });

    it('should not change locale if translations not loaded', () => {
      setLocale('zh-CN');
      expect(getLocale()).toBe('en');
    });
  });
});
