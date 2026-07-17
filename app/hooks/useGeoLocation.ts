// app/hooks/useGeoLocation.ts v2.7.0
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { GEO_INFO_EXPIRY } from '../constants';
import { logError } from '../lib/error-handler';
import { useGeoStore, GeoLocation } from '../store';

const GEO_OPT_IN_KEY = 'geoOptIn';
const GEO_FETCH_TIMEOUT = 5000;

const FALLBACK_GEO: GeoLocation = { city: 'Unknown', country: 'Global' };

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function hasOptIn(): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(GEO_OPT_IN_KEY) === 'true';
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
    const raw = window.localStorage.getItem(GEO_OPT_IN_KEY);
    const granted = raw === 'true';
    setOptInRequested(raw !== null);
    setOptInGrantedState(granted);
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
      const cachedGeo = window.localStorage.getItem('geoInfo');
      const expiry = window.localStorage.getItem('geoInfoExpiry');
      const isExpired = !expiry || Date.now() > parseInt(expiry, 10);

      if (cachedGeo && !isExpired && !forceRefresh) {
        try {
          const parsedGeo = JSON.parse(cachedGeo) as GeoLocation;
          setGeo(parsedGeo);
          setIsLoading(false);
          return;
        } catch (error) {
          logError(error, 'Failed to parse cached geo info');
        }
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