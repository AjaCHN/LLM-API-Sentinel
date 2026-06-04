// app/hooks/useI18n.ts v2.6.1
'use client';

import { useState, useEffect, useCallback } from 'react';
import { setLocale, getLocale, initLocale, t as translate, formatMessage } from '../lib/i18n';

export function useI18n() {
  const [locale, setCurrentLocale] = useState('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initLocale();
    setCurrentLocale(getLocale());
    setIsInitialized(true);
  }, []);

  const changeLocale = useCallback((newLocale: string) => {
    setLocale(newLocale);
    setCurrentLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
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
    isInitialized,
    availableLocales: [
      { code: 'en', name: 'English' },
      { code: 'zh-CN', name: '中文' },
    ],
  };
}
