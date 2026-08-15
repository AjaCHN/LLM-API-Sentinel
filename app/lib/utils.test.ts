// app/lib/utils.test.ts v2.9.6
import {
  cn,
  getApiColor,
  getStatusColor,
  getStatusPulseColor,
  getLatencyColor,
  getProgressBarVariant,
} from './utils';
import { LATENCY_THRESHOLD } from '../constants';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });
  it('dedupes conflicting tailwind classes via tailwind-merge', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
  it('handles conditional falsy values', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b');
  });
});

describe('getApiColor', () => {
  it('returns known color for mapped api', () => {
    expect(getApiColor('openai-gpt-4o')).toBe('#10a37f');
  });
  it('falls back to default for unknown api', () => {
    expect(getApiColor('does-not-exist')).toBe('#141414');
  });
});

describe('getStatusColor', () => {
  it('maps online/degraded/offline/default', () => {
    expect(getStatusColor('online')).toBe('bg-emerald-500');
    expect(getStatusColor('degraded')).toBe('bg-amber-500');
    expect(getStatusColor('offline')).toBe('bg-destructive');
    expect(getStatusColor('unknown' as never)).toBe('bg-muted');
  });
});

describe('getStatusPulseColor', () => {
  it('maps known statuses and default', () => {
    expect(getStatusPulseColor('online')).toContain('34,197,94');
    expect(getStatusPulseColor('degraded')).toContain('245,158,11');
    expect(getStatusPulseColor('offline')).toContain('239,68,68');
    expect(getStatusPulseColor('unknown' as never)).toBe('');
  });
});

describe('getLatencyColor', () => {
  it('returns danger color when offline', () => {
    expect(getLatencyColor(0, LATENCY_THRESHOLD, true)).toBe('text-destructive');
  });
  it('returns warning when latency exceeds threshold', () => {
    expect(getLatencyColor(LATENCY_THRESHOLD + 1, LATENCY_THRESHOLD, false)).toBe('text-amber-500');
  });
  it('returns success when within threshold', () => {
    expect(getLatencyColor(LATENCY_THRESHOLD - 1, LATENCY_THRESHOLD, false)).toBe('text-emerald-400');
  });
});

describe('getProgressBarVariant', () => {
  it('returns danger when offline', () => {
    expect(getProgressBarVariant(0, LATENCY_THRESHOLD, true)).toBe('danger');
  });
  it('returns warning when over threshold', () => {
    expect(getProgressBarVariant(LATENCY_THRESHOLD + 1, LATENCY_THRESHOLD, false)).toBe('warning');
  });
  it('returns success when within threshold', () => {
    expect(getProgressBarVariant(LATENCY_THRESHOLD - 1, LATENCY_THRESHOLD, false)).toBe('success');
  });
});
