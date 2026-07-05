// app/hooks/useGeoLocation.ts v2.6.3
'use client';

import { useEffect, useState, useCallback } from 'react';
import { GEO_INFO_EXPIRY } from '../constants';
import { logError } from '../lib/error-handler';
import { useGeoStore, GeoLocation } from '../store';

const GEO_OPT_IN_KEY = 'geoOptIn';

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
  // clear any cached geo data so we don't leak IP after opt-out
  window.localStorage.removeItem('geoInfo');
  window.localStorage.removeItem('geoInfoExpiry');
  useGeoStore.getState().clearGeo();
}

export function useGeoLocation() {
  const { geo, isLoading, setGeo, setIsLoading } = useGeoStore();
  const [optInGranted, setOptInGrantedState] = useState<boolean>(false);
  const [optInRequested, setOptInRequested] = useState<boolean>(false);

  // hydrate opt-in state from localStorage on mount
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

  useEffect(() => {
    // Only run fetch once opt-in state is known and user has opted in.
    if (!isBrowser()) return;

    // If no opt-in, ensure fallback is used and never fetch.
    if (!hasOptIn()) {
      setIsLoading(false);
      setGeo(FALLBACK_GEO);
      return;
    }

    const fetchGeoLocation = async () => {
      try {
        const cachedGeo = window.localStorage.getItem('geoInfo');
        const expiry = window.localStorage.getItem('geoInfoExpiry');
        const isExpired = !expiry || Date.now() > parseInt(expiry, 10);

        if (cachedGeo) {
          try {
            const parsedGeo = JSON.parse(cachedGeo) as GeoLocation;
            setGeo(parsedGeo);
            setIsLoading(false);
          } catch (error) {
            logError(error, 'Failed to parse cached geo info');
          }
        }

        if (!cachedGeo || isExpired) {
          setIsLoading(true);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          try {
            const response = await fetch('https://ipapi.co/json/', {
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
              throw new Error(`geo service responded ${response.status}`);
            }
            const data = await response.json();

            const geoData: GeoLocation = {
              city: typeof data.city === 'string' && data.city ? data.city : 'Unknown',
              country: typeof data.country_name === 'string' && data.country_name ? data.country_name : 'Global',
            };

            setGeo(geoData);
            window.localStorage.setItem('geoInfo', JSON.stringify(geoData));
            window.localStorage.setItem(
              'geoInfoExpiry',
              String(Date.now() + GEO_INFO_EXPIRY),
            );
          } finally {
            clearTimeout(timeoutId);
          }
        }
      } catch (error) {
        logError(error, 'Failed to fetch geo info');
        setGeo(FALLBACK_GEO);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeoLocation();
  }, [setGeo, setIsLoading, optInGranted]);

  return {
    geo: geo ?? FALLBACK_GEO,
    isLoading,
    optInGranted,
    optInRequested,
    setOptInGranted,
  };
}
