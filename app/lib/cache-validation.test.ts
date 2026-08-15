// app/lib/cache-validation.test.ts v2.9.6
import {
  isValidCacheEntry,
  isValidCache,
  calculateCacheExpiry,
  isCacheValid,
} from './cache-validation';
import { CACHE_EXPIRY, MIN_CACHE_EXPIRY, MAX_CACHE_EXPIRY } from '../constants';

describe('isValidCacheEntry', () => {
  it('rejects null and non-object', () => {
    expect(isValidCacheEntry(null)).toBe(false);
    expect(isValidCacheEntry(42)).toBe(false);
    expect(isValidCacheEntry('str')).toBe(false);
  });
  it('rejects missing fields', () => {
    expect(isValidCacheEntry({ result: {}, timestamp: 1 })).toBe(false);
    expect(isValidCacheEntry({ result: {}, expiry: 1 })).toBe(false);
  });
  it('accepts well-formed entry', () => {
    expect(isValidCacheEntry({ result: { status: 'online' }, timestamp: 1, expiry: 1000 })).toBe(true);
  });
});

describe('isValidCache', () => {
  it('rejects non-object', () => {
    expect(isValidCache(null)).toBe(false);
  });
  it('rejects cache with invalid entry', () => {
    expect(isValidCache({ a: { result: {}, timestamp: 1, expiry: 1 }, b: { foo: 1 } })).toBe(false);
  });
  it('accepts cache of valid entries', () => {
    expect(isValidCache({ a: { result: {}, timestamp: 1, expiry: 1 } })).toBe(true);
  });
});

describe('calculateCacheExpiry', () => {
  it('uses base expiry for degraded', () => {
    expect(calculateCacheExpiry('x', 'degraded', 500)).toBe(CACHE_EXPIRY);
  });
  it('uses min expiry for offline', () => {
    expect(calculateCacheExpiry('x', 'offline', 0)).toBe(MIN_CACHE_EXPIRY);
  });
  it('doubles expiry for fast online', () => {
    const r = calculateCacheExpiry('x', 'online', 50);
    expect(r).toBe(Math.min(MAX_CACHE_EXPIRY, CACHE_EXPIRY * 2));
  });
  it('halves expiry for slow online', () => {
    const r = calculateCacheExpiry('x', 'online', 2000);
    expect(r).toBe(Math.max(MIN_CACHE_EXPIRY, CACHE_EXPIRY / 2));
  });
  it('uses base expiry for normal online', () => {
    expect(calculateCacheExpiry('x', 'online', 500)).toBe(CACHE_EXPIRY);
  });
});

describe('isCacheValid', () => {
  it('returns true within expiry', () => {
    const now = Date.now();
    expect(isCacheValid({ timestamp: now, expiry: 10000 })).toBe(true);
  });
  it('returns false when expired', () => {
    const old = Date.now() - 20000;
    expect(isCacheValid({ timestamp: old, expiry: 1000 })).toBe(false);
  });
});
