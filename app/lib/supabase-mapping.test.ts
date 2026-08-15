// app/lib/supabase-mapping.test.ts v2.9.6
import {
  toApiStatusUpsert,
  toStatusHistoryInsert,
  fromApiStatusRow,
} from './supabase-mapping';
import type { ApiStatus } from '../types';

function baseStatus(overrides: Partial<ApiStatus> = {}): ApiStatus {
  return {
    id: 'openai-gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    url: 'https://api.openai.com/v1/models',
    status: 'online',
    latency: 120,
    lastChecked: '2026-08-15T12:00:00.000Z',
    error: undefined,
    retries: 0,
    errorRate: 0,
    availability: 100,
    uptime: 100,
    averageLatency: 120,
    maxLatency: 200,
    minLatency: 80,
    ...overrides,
  };
}

describe('toApiStatusUpsert', () => {
  it('maps fields and provides defaults', () => {
    const [row] = toApiStatusUpsert([baseStatus({ error: undefined })]);
    expect(row.id).toBe('openai-gpt-4o');
    expect(row.status).toBe('online');
    expect(row.error).toBeNull();
    expect(row.retries).toBe(0);
    expect(row.error_rate).toBe(0);
    expect(row.availability).toBe(100);
    expect(row.last_checked).toBe('2026-08-15T12:00:00.000Z');
    expect(row.updated_at).toBeDefined();
  });

  it('maps nullish latencies to undefined', () => {
    const [row] = toApiStatusUpsert([baseStatus({ averageLatency: undefined, maxLatency: undefined, minLatency: undefined })]);
    expect(row.average_latency).toBeUndefined();
    expect(row.max_latency).toBeUndefined();
    expect(row.min_latency).toBeUndefined();
  });
});

describe('toStatusHistoryInsert', () => {
  it('maps history rows with defaults', () => {
    const [row] = toStatusHistoryInsert([baseStatus({ error: 'boom' })]);
    expect(row.api_id).toBe('openai-gpt-4o');
    expect(row.status).toBe('online');
    expect(row.latency).toBe(120);
    expect(row.error).toBe('boom');
    expect(row.timestamp).toBeDefined();
  });
});

describe('fromApiStatusRow', () => {
  it('maps db row back to ApiStatus', () => {
    const status = fromApiStatusRow({
      id: 'openai-gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      url: 'https://api.openai.com/v1/models',
      status: 'degraded',
      latency: 1500,
      last_checked: '2026-08-15T12:00:00.000Z',
      error: 'slow',
      retries: 1,
      error_rate: 2,
      availability: 98,
      uptime: 99,
      average_latency: 1300,
      max_latency: 1800,
      min_latency: 900,
    });
    expect(status.status).toBe('degraded');
    expect(status.latency).toBe(1500);
    expect(status.lastChecked).toBe('2026-08-15T12:00:00.000Z');
    expect(status.error).toBe('slow');
    expect(status.averageLatency).toBe(1300);
  });
});
