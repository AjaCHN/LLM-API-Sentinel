// app/hooks/useI18n.ts v2.6.3
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  setLocale,
  getLocale,
  initLocale,
  loadLocale,
  t as translate,
  formatMessage,
  supportedLocales,
} from '../lib/i18n';

export function useI18n() {
  const [locale, setCurrentLocale] = useState('en');

  useEffect(() => {
    initLocale();
    setCurrentLocale(getLocale());
  }, []);

  const changeLocale = useCallback(async (newLocale: string) => {
    await loadLocale(newLocale);
    setLocale(newLocale);
    setCurrentLocale(getLocale());
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', getLocale());
    }
  }, []);

  const t = useCallback((key: string) => {
    return translate(key);
  }, []);

  const format = useCallback((template: string, params: Record<string, string | number>) => {
    return formatMessage(template, params);
  }, []);

  return {
    locale,
    setLocale: changeLocale,
    t,
    format,
    supportedLocales,
  };
}
