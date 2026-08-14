// app/lib/concurrency.test.ts v2.8.2
import { ConcurrencyManager, processBatch } from './concurrency';

describe('ConcurrencyManager', () => {
  it('resolves a simple queued request', async () => {
    const mgr = new ConcurrencyManager<number>(2);
    const result = await mgr.add(() => Promise.resolve(42));
    expect(result).toBe(42);
  });

  it('respects concurrency limit', async () => {
    const limit = 2;
    const mgr = new ConcurrencyManager<number>(limit);
    let active = 0;
    let maxActive = 0;

    const make = () =>
      mgr.add(async () => {
        active++;
        maxActive = Math.max(maxActive, active);
        await new Promise((r) => setTimeout(r, 10));
        active--;
        return 1;
      });

    await Promise.all(Array.from({ length: 6 }, make));
    expect(maxActive).toBeLessThanOrEqual(limit);
  });

  it('rejects on timeout', async () => {
    const mgr = new ConcurrencyManager<number>(1);
    await expect(
      mgr.add(() => new Promise<number>(() => {}), { timeout: 20 })
    ).rejects.toThrow(/timed out/);
  });

  it('retries failed requests then rejects when retries exhausted', async () => {
    const mgr = new ConcurrencyManager<number>(1);
    let calls = 0;
    await expect(
      mgr.add(
        () => {
          calls++;
          return Promise.reject(new Error('boom'));
        },
        { retries: 1, retryDelay: 1 }
      )
    ).rejects.toThrow('boom');
    // 1 初始 + 1 重试
    expect(calls).toBe(2);
  });

  it('exposes queue metrics', () => {
    const mgr = new ConcurrencyManager<number>(1);
    expect(mgr.getQueueLength()).toBe(0);
    expect(mgr.getActiveRequests()).toBe(0);
    expect(mgr.getConcurrencyLimit()).toBeGreaterThanOrEqual(1);
  });
});

describe('processBatch', () => {
  it('processes all items and returns results in order', async () => {
    const items = [1, 2, 3];
    const results = await processBatch(items, async (n) => n * 2);
    expect(results).toEqual([2, 4, 6]);
  });
});
