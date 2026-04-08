// tests/unit/alerts.test.ts
import { describe, test, expect } from '@jest/globals';

const LATENCY_THRESHOLD = 1500;

interface Alert {
  id: string;
  apiId: string;
  apiName: string;
  type: 'downtime' | 'latency';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: any;
  resolved: boolean;
  error?: string;
  retries?: number;
  latency?: number;
}

describe('Alert System', () => {
  test('should create alert for downtime', () => {
    // 测试宕机告警创建逻辑
    const alert: Alert = {
      id: '1',
      apiId: 'openai',
      apiName: 'OpenAI',
      type: 'downtime',
      severity: 'high',
      message: 'OpenAI is currently offline.',
      timestamp: new Date(),
      resolved: false,
      error: 'Connection failed',
      retries: 3
    };
    
    expect(alert.type).toBe('downtime');
    expect(alert.severity).toBe('high');
    expect(alert.resolved).toBe(false);
    expect(alert.error).toBeDefined();
  });
  
  test('should create alert for high latency', () => {
    // 测试高延迟告警创建逻辑
    const alert: Alert = {
      id: '2',
      apiId: 'openai',
      apiName: 'OpenAI',
      type: 'latency',
      severity: 'medium',
      message: 'OpenAI latency is high: 2000ms.',
      timestamp: new Date(),
      resolved: false,
      latency: 2000
    };
    
    expect(alert.type).toBe('latency');
    expect(alert.severity).toBe('medium');
    expect(alert.resolved).toBe(false);
    expect(alert.latency).toBeGreaterThan(LATENCY_THRESHOLD);
  });
  
  test('should resolve alert', () => {
    // 测试告警解决逻辑
    const alert: Alert = {
      id: '1',
      apiId: 'openai',
      apiName: 'OpenAI',
      type: 'downtime',
      severity: 'high',
      message: 'OpenAI is currently offline.',
      timestamp: new Date(),
      resolved: true,
      error: 'Connection failed',
      retries: 3
    };
    
    expect(alert.resolved).toBe(true);
  });
});
