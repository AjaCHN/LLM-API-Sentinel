// app/lib/metrics.test.ts v2.8.2
import { calculateMetrics } from './metrics';
import * as supabaseModule from './supabase';

// mock supabase 查询链：链式调用后 await 返回结果
function mockSupabaseQuery(rows: Array<Record<string, unknown>>) {
  const builder: Record<string, unknown> = {
    select: () => builder,
    gte: () => builder,
    order: () => builder,
    eq: () => builder,
    limit: () => builder,
    // 使 builder 可 await：await query 时解析为 { data, error }
    then: (_resolve: (v: unknown) => void) =>
      Promise.resolve({ data: rows, error: null }).then(_resolve),
  };
  (supabaseModule as unknown as { supabase: unknown }).supabase = {
    from: () => builder,
  };
}

describe('calculateMetrics', () => {
  it('returns zeroed metrics when no history', async () => {
    mockSupabaseQuery([]);
    const metrics = await calculateMetrics('openai');
    expect(metrics.totalChecks).toBe(0);
    expect(metrics.availability).toBe(100);
  });

  it('computes availability and error rate from mixed history', async () => {
    mockSupabaseQuery([
      { id: '1', api_id: 'openai', status: 'online', latency: 100, timestamp: '2026-08-14T10:00:00Z' },
      { id: '2', api_id: 'openai', status: 'offline', latency: 0, timestamp: '2026-08-14T10:01:00Z' },
    ]);
    const metrics = await calculateMetrics('openai');
    expect(metrics.totalChecks).toBe(2);
    expect(metrics.failedChecks).toBe(1);
    expect(metrics.availability).toBe(50);
    expect(metrics.errorRate).toBe(50);
    expect(metrics.maxLatency).toBe(100);
    expect(metrics.minLatency).toBe(100);
  });

  it('falls back to safe defaults when data shape is malformed', async () => {
    mockSupabaseQuery([
      { id: 123, api_id: null, status: 'weird', latency: 'fast', timestamp: 'not-a-date' },
    ]);
    const metrics = await calculateMetrics('openai');
    expect(metrics.totalChecks).toBe(1);
    expect(metrics.maxLatency).toBe(0);
  });
});
