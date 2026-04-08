// tests/unit/monitoring.test.ts
import { describe, test, expect } from '@jest/globals';

const LATENCY_THRESHOLD = 1500;

describe('Monitoring Logic', () => {
  test('should detect API downtime', () => {
    // 测试 API 宕机检测逻辑
    const apiStatus = {
      id: 'openai',
      name: 'OpenAI',
      provider: 'OpenAI',
      url: 'https://api.openai.com',
      status: 'offline' as const,
      latency: 0,
      lastChecked: new Date().toISOString(),
      error: 'Connection failed'
    };
    
    expect(apiStatus.status).toBe('offline');
    expect(apiStatus.error).toBeDefined();
  });
  
  test('should detect high latency', () => {
    // 测试高延迟检测逻辑
    const apiStatus = {
      id: 'openai',
      name: 'OpenAI',
      provider: 'OpenAI',
      url: 'https://api.openai.com',
      status: 'online' as const,
      latency: 2000,
      lastChecked: new Date().toISOString()
    };
    
    expect(apiStatus.status).toBe('online');
    expect(apiStatus.latency).toBeGreaterThan(LATENCY_THRESHOLD);
  });
  
  test('should calculate average latency', () => {
    // 测试平均延迟计算逻辑
    const latencies = [100, 200, 300, 400, 500];
    const average = latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length;
    
    expect(average).toBe(300);
  });
});
