// app/lib/cache.test.ts v2.8.2
import {
  calculateCacheExpiry,
  isCacheValid,
} from './cache-validation';
import {
  setCache,
  getCache,
  clearApiCache,
  clearCache,
} from './cache';

const makeResult = (over: Partial<{ status: string; latency: number }> = {}) => ({
  id: 'openai',
  name: 'OpenAI',
  provider: 'OpenAI',
  url: 'https://api.openai.com',
  status: (over.status ?? 'online') as 'online' | 'offline' | 'degraded',
  latency: over.latency ?? 120,
  lastChecked: new Date(),
});

describe('calculateCacheExpiry', () => {
  it('returns a positive expiry', () => {
    expect(calculateCacheExpiry('openai', 'online', 100)).toBeGreaterThan(0);
  });

  it('returns a positive expiry for offline status', () => {
    const offline = calculateCacheExpiry('openai', 'offline', 0);
    expect(offline).toBeGreaterThan(0);
  });

  it('returns a positive expiry for online status', () => {
    const online = calculateCacheExpiry('openai', 'online', 120);
    expect(online).toBeGreaterThan(0);
  });
});

describe('isCacheValid', () => {
  it('returns false for expired entry', () => {
    const expired = { timestamp: Date.now() - 999999, expiry: 1 };
    expect(isCacheValid(expired)).toBe(false);
  });

  it('returns true for fresh entry', () => {
    const fresh = { timestamp: Date.now(), expiry: 60000 };
    expect(isCacheValid(fresh)).toBe(true);
  });
});

describe('setCache / getCache', () => {
  beforeEach(() => clearCache());

  it('stores and retrieves a result', () => {
    setCache('openai', makeResult() as never);
    const cached = getCache('openai');
    expect(cached).not.toBeNull();
    expect(cached?.id).toBe('openai');
  });

  it('clearApiCache removes single api entry', () => {
    setCache('openai', makeResult() as never);
    clearApiCache('openai');
    expect(getCache('openai')).toBeNull();
  });
});
