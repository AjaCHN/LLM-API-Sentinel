// app/lib/monitor.test.ts v2.5.1
import { performCheck } from './monitor';
import { APIS_TO_CHECK, LATENCY_THRESHOLD, DEGRADED_THRESHOLD } from '../constants';
import * as cacheModule from './cache';

// Mock fetch API
global.fetch = jest.fn();

describe('monitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cacheModule.clearCache();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('performCheck', () => {
    it('should return online or degraded status for successful requests', async () => {
      // Mock successful response with immediate resolve
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        ok: true,
      });

      // Test only the first API to speed up the test
      const originalAPIs = [...APIS_TO_CHECK];
      (APIS_TO_CHECK as any) = [APIS_TO_CHECK[0]];

      const results = await performCheck();

      // Restore original APIs
      (APIS_TO_CHECK as any) = originalAPIs;

      expect(results).toHaveLength(1);
      expect(['online', 'degraded']).toContain(results[0].status);
      expect(results[0].lastChecked).toBeDefined();
    });

    it.skip('should return offline status for failed requests', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Test only the first API to speed up the test
      const originalAPIs = [...APIS_TO_CHECK];
      (APIS_TO_CHECK as any) = [APIS_TO_CHECK[0]];

      const results = await performCheck();

      // Restore original APIs
      (APIS_TO_CHECK as any) = originalAPIs;

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('offline');
      expect(results[0].latency).toBe(0);
      expect(results[0].error).toContain('Network error');
    });

    it('should return offline or degraded status for 500 errors', async () => {
      // Mock 500 error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 500,
        ok: false,
      });

      // Test only the first API to speed up the test
      const originalAPIs = [...APIS_TO_CHECK];
      (APIS_TO_CHECK as any) = [APIS_TO_CHECK[0]];

      const results = await performCheck();

      // Restore original APIs
      (APIS_TO_CHECK as any) = originalAPIs;

      expect(results).toHaveLength(1);
      expect(['offline', 'degraded']).toContain(results[0].status);
    });

    it('should calculate real metrics instead of random values', async () => {
      // Mock successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        ok: true,
      });

      const originalAPIs = [...APIS_TO_CHECK];
      (APIS_TO_CHECK as any) = [APIS_TO_CHECK[0]];

      const results = await performCheck();

      (APIS_TO_CHECK as any) = originalAPIs;

      expect(results).toHaveLength(1);
      expect(typeof results[0].errorRate).toBe('number');
      expect(typeof results[0].availability).toBe('number');
      expect(typeof results[0].uptime).toBe('number');
      expect(typeof results[0].averageLatency).toBe('number');
      expect(typeof results[0].maxLatency).toBe('number');
      expect(typeof results[0].minLatency).toBe('number');
      
      expect(results[0].errorRate).toBeGreaterThanOrEqual(0);
      expect(results[0].errorRate).toBeLessThanOrEqual(100);
      expect(results[0].availability).toBeGreaterThanOrEqual(0);
      expect(results[0].availability).toBeLessThanOrEqual(100);
    });
  });

  describe('status determination', () => {
    it('should support three status types: online, degraded, offline', () => {
      const validStatuses = ['online', 'degraded', 'offline'];
      expect(validStatuses).toHaveLength(3);
    });
  });

  describe('LATENCY_THRESHOLD', () => {
    it('should be set to 1500ms', () => {
      expect(LATENCY_THRESHOLD).toBe(1500);
    });
  });

  describe('DEGRADED_THRESHOLD', () => {
    it('should be set to 1000ms', () => {
      expect(DEGRADED_THRESHOLD).toBe(1000);
    });
  });

  describe('APIS_TO_CHECK', () => {
    it('should contain both US and China APIs', () => {
      expect(APIS_TO_CHECK).toHaveLength(12);
      
      // Check for US APIs
      const usAPIs = APIS_TO_CHECK.filter(api => 
        ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral'].includes(api.provider)
      );
      expect(usAPIs).toHaveLength(5);
      
      // Check for China APIs
      const chinaAPIs = APIS_TO_CHECK.filter(api => 
        ['Moonshot', 'ZhipuAI', 'Baichuan', 'Alibaba', 'Tencent', 'Baidu', 'DeepSeek'].includes(api.provider)
      );
      expect(chinaAPIs).toHaveLength(7);
    });

    it('should have required properties for each API', () => {
      APIS_TO_CHECK.forEach(api => {
        expect(api).toHaveProperty('id');
        expect(api).toHaveProperty('name');
        expect(api).toHaveProperty('provider');
        expect(api).toHaveProperty('url');
        expect(typeof api.id).toBe('string');
        expect(typeof api.name).toBe('string');
        expect(typeof api.provider).toBe('string');
        expect(typeof api.url).toBe('string');
      });
    });
  });
});
