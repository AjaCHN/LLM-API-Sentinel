// app/lib/monitor.test.ts v2.9.6
import { APIS_TO_CHECK, LATENCY_THRESHOLD, DEGRADED_THRESHOLD } from '../constants';
import { performCheck, getConcurrencyStatus } from './monitor';

describe('APIS_TO_CHECK', () => {
  it('should contain all default APIs', () => {
    expect(APIS_TO_CHECK).toBeDefined();
    expect(Array.isArray(APIS_TO_CHECK)).toBe(true);
    expect(APIS_TO_CHECK.length).toBeGreaterThan(0);
  });

  it('should contain both US and China APIs', () => {
    expect(APIS_TO_CHECK.length).toBeGreaterThanOrEqual(26);

    const usAPIs = APIS_TO_CHECK.filter((api: ApiConfig) =>
      ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral', 'xAI', 'Cohere', 'Perplexity', 'Together AI', 'Replicate', 'Stability AI', 'HuggingFace', 'OpenRouter', 'Fireworks', 'NVIDIA', 'AI21'].includes(api.provider)
    );
    expect(usAPIs.length).toBeGreaterThanOrEqual(16);

    const chinaAPIs = APIS_TO_CHECK.filter((api: ApiConfig) =>
      ['Moonshot', 'ZhipuAI', 'Baichuan', 'Alibaba', 'Tencent', 'Baidu', 'DeepSeek', 'MiniMax', 'iFlytek', 'ByteDance', '01.AI', 'SiliconFlow', 'StepFun'].includes(api.provider)
    );
    expect(chinaAPIs.length).toBeGreaterThanOrEqual(13);
  });

  it('each API should have required fields', () => {
    APIS_TO_CHECK.forEach((api: ApiConfig) => {
      expect(api.id).toBeTruthy();
      expect(api.name).toBeTruthy();
      expect(api.provider).toBeTruthy();
      expect(api.url).toMatch(/^https?:\/\//);
    });
  });

  it('API ids should be unique', () => {
    const ids = APIS_TO_CHECK.map((a: ApiConfig) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('thresholds', () => {
  it('should have valid threshold values', () => {
    expect(LATENCY_THRESHOLD).toBeGreaterThan(0);
    // 降级阈值不应高于延迟上限阈值（延迟越高越应判为 degraded）
    expect(DEGRADED_THRESHOLD).toBeLessThanOrEqual(LATENCY_THRESHOLD);
  });
});

describe('getConcurrencyStatus', () => {
  it('returns a concurrency snapshot object', () => {
    const status = getConcurrencyStatus();
    expect(status).toHaveProperty('queueLength');
    expect(status).toHaveProperty('activeRequests');
    expect(status).toHaveProperty('concurrencyLimit');
    expect(status).toHaveProperty('networkQuality');
  });
});

describe('performCheck (network isolated)', () => {
  afterEach(() => {
    // 清理全局 mock，避免影响其他测试
    // @ts-expect-error 测试中可重置全局 fetch
    delete global.fetch;
  });

  it('returns one result per configured API without throwing', async () => {
    // 在 CI/无网络环境下 mock fetch，验证编排逻辑与返回形态
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
    }) as unknown as typeof fetch;
    const results = await performCheck();
    expect(results).toHaveLength(APIS_TO_CHECK.length);
    results.forEach((r) => {
      expect(['online', 'offline', 'degraded']).toContain(r.status);
      expect(typeof r.latency).toBe('number');
      expect(r).toHaveProperty('lastChecked');
    });
  }, 30000);

  it('marks unreachable hosts without throwing and records all', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;
    const results = await performCheck();
    expect(results.length).toBe(APIS_TO_CHECK.length);
    results.forEach((r) => {
      expect(['online', 'offline', 'degraded']).toContain(r.status);
      expect(typeof r.latency).toBe('number');
      expect(r).toHaveProperty('lastChecked');
    });
  }, 30000);
});
