// app/hooks/useI18n.ts v2.9.3
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  setLocale as persistLocale,
  initLocale,
  getLocale,
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
    persistLocale(newLocale);
    setCurrentLocale(getLocale());
  }, []);

  const t = useCallback((key: string) => translate(key), []);

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
