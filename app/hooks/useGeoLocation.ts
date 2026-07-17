// app/hooks/useGeoLocation.ts v2.7.1
// 安全加固: 添加 localStorage 数据验证，防止 XSS 或数据污染

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { GEO_INFO_EXPIRY } from '../constants';
import { logError } from '../lib/error-handler';
import { useGeoStore, GeoLocation } from '../store';

const GEO_OPT_IN_KEY = 'geoOptIn';
const GEO_FETCH_TIMEOUT = 5000;

const FALLBACK_GEO: GeoLocation = { city: 'Unknown', country: 'Global' };

/**
 * 安全验证 GeoLocation 对象结构
 * 防止 localStorage 被篡改导致的类型错误或 XSS
 */
function isValidGeoLocation(data: unknown): data is GeoLocation {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  // city 必须是非空字符串且不包含危险字符
  if (typeof obj.city !== 'string' || !obj.city.trim()) return false;
  if (obj.city.length > 100) return false;

  // country 必须是非空字符串且不包含危险字符
  if (typeof obj.country !== 'string' || !obj.country.trim()) return false;
  if (obj.country.length > 100) return false;

  // ip 可选，若存在必须是有效的 IP 格式
  if (obj.ip !== undefined) {
    if (typeof obj.ip !== 'string') return false;
    if (obj.ip.length > 45) return false; // IPv6 最大长度
    if (!/^[\d.:a-fA-F]+$/.test(obj.ip)) return false;
  }

  return true;
}

/**
 * 安全地从 localStorage 读取 geoInfo，失败则返回 null
 */
function getSafeGeoFromStorage(): GeoLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = window.localStorage.getItem('geoInfo');
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (isValidGeoLocation(parsed)) {
      return parsed;
    }

    // 无效数据则清除
    window.localStorage.removeItem('geoInfo');
    window.localStorage.removeItem('geoInfoExpiry');
    return null;
  } catch {
    // JSON 解析失败，清除无效数据
    try {
      window.localStorage.removeItem('geoInfo');
      window.localStorage.removeItem('geoInfoExpiry');
    } catch {
      // ignore
    }
    return null;
  }
}

/**
 * 安全地从 localStorage 读取 opt-in 值
 */
function getSafeOptInFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const val = window.localStorage.getItem(GEO_OPT_IN_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function hasOptIn(): boolean {
  if (!isBrowser()) return false;
  return getSafeOptInFromStorage();
}

export function enableGeoLocation(): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(GEO_OPT_IN_KEY, 'true');
}

export function disableGeoLocation(): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(GEO_OPT_IN_KEY, 'false');
  window.localStorage.removeItem('geoInfo');
  window.localStorage.removeItem('geoInfoExpiry');
  useGeoStore.getState().clearGeo();
}

export function useGeoLocation() {
  const { geo, isLoading, setGeo, setIsLoading } = useGeoStore();
  const [optInGranted, setOptInGrantedState] = useState<boolean>(false);
  const [optInRequested, setOptInRequested] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isBrowser()) return;
    try {
      const raw = window.localStorage.getItem(GEO_OPT_IN_KEY);
      const granted = raw === 'true';
      setOptInRequested(raw !== null);
      setOptInGrantedState(granted);
    } catch {
      setOptInRequested(false);
      setOptInGrantedState(false);
    }
  }, []);

  const setOptInGranted = useCallback((value: boolean) => {
    if (isBrowser()) {
      window.localStorage.setItem(GEO_OPT_IN_KEY, String(value));
    }
    setOptInRequested(true);
    setOptInGrantedState(value);
  }, []);

  const fetchGeoLocation = useCallback(async (forceRefresh: boolean = false) => {
    if (!isBrowser()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const cachedGeo = getSafeGeoFromStorage();
      let expiryTime: number | null = null;
      try {
        const expiry = window.localStorage.getItem('geoInfoExpiry');
        expiryTime = expiry ? parseInt(expiry, 10) : null;
      } catch {
        expiryTime = null;
      }
      const isExpired = !expiryTime || Date.now() > expiryTime;

      if (cachedGeo && !isExpired && !forceRefresh) {
        setGeo(cachedGeo);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, GEO_FETCH_TIMEOUT);

      const response = await fetch('https://ipapi.co/json/', {
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Geo API responded with status ${response.status}`);
      }

      const data = await response.json();

      // Schema 校验：确保返回数据包含必要的字符串字段
      const city = typeof data.city === 'string' && data.city.trim() ? data.city.trim() : 'Unknown';
      const country = typeof data.country_name === 'string' && data.country_name.trim() ? data.country_name.trim() : 'Global';
      const ip = typeof data.ip === 'string' && /^[\d.:a-fA-F]+$/.test(data.ip) ? data.ip : undefined;

      const geoData: GeoLocation = { city, country, ip };

      setGeo(geoData);
      window.localStorage.setItem('geoInfo', JSON.stringify(geoData));
      window.localStorage.setItem(
        'geoInfoExpiry',
        String(Date.now() + GEO_INFO_EXPIRY),
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      logError(error, 'Failed to fetch geo info');
      if (!forceRefresh) {
        setGeo(FALLBACK_GEO);
      }
    } finally {
      setIsLoading(false);
    }
  }, [setGeo, setIsLoading]);

  const refreshGeo = useCallback(() => {
    if (hasOptIn()) {
      fetchGeoLocation(true);
    }
  }, [fetchGeoLocation]);

  useEffect(() => {
    if (!isBrowser()) return;

    if (!hasOptIn()) {
      setIsLoading(false);
      if (!geo || geo.city === undefined) {
        setGeo(FALLBACK_GEO);
      }
      return;
    }

    fetchGeoLocation();
  }, [fetchGeoLocation, setGeo, setIsLoading, geo]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    geo: geo ?? FALLBACK_GEO,
    isLoading,
    optInGranted,
    optInRequested,
    setOptInGranted,
    refreshGeo,
  };
}