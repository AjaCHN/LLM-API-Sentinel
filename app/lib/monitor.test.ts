// app/lib/monitor.test.ts v2.6.0
import { APIS_TO_CHECK, LATENCY_THRESHOLD } from '../constants';

interface ApiConfig {
  id: string;
  name: string;
  provider: string;
  url: string;
}

describe('monitor constants', () => {
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
      
      const usAPIs = APIS_TO_CHECK.filter((api: ApiConfig) => 
        ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral'].includes(api.provider)
      );
      expect(usAPIs).toHaveLength(5);
      
      const chinaAPIs = APIS_TO_CHECK.filter((api: ApiConfig) => 
        ['Moonshot', 'ZhipuAI', 'Baichuan', 'Alibaba', 'Tencent', 'Baidu', 'DeepSeek'].includes(api.provider)
      );
      expect(chinaAPIs).toHaveLength(7);
    });

    it('should have required properties for each API', () => {
      APIS_TO_CHECK.forEach((api: ApiConfig) => {
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

    it('should have valid URLs for all APIs', () => {
      APIS_TO_CHECK.forEach((api: ApiConfig) => {
        expect(api.url).toMatch(/^https?:\/\/.+/);
      });
    });

    it('should have unique IDs for all APIs', () => {
      const ids = APIS_TO_CHECK.map((api: ApiConfig) => api.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
