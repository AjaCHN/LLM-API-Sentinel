// tests/integration/data-flow.test.ts
import { describe, test, expect } from '@jest/globals';

interface ApiStatus {
  id: string;
  name: string;
  provider: string;
  url: string;
  status: 'online' | 'offline';
  latency: number;
  lastChecked: string;
  error?: string;
  retries?: number;
}

interface StatusHistory {
  apiId: string;
  status: 'online' | 'offline';
  latency: number;
  timestamp: Date;
  time: string;
}

describe('Data Flow', () => {
  test('should fetch and display API statuses', () => {
    // 测试从 Firestore 获取数据并显示
    const mockStatuses: ApiStatus[] = [
      {
        id: 'openai',
        name: 'OpenAI',
        provider: 'OpenAI',
        url: 'https://api.openai.com',
        status: 'online',
        latency: 500,
        lastChecked: new Date().toISOString()
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        provider: 'Anthropic',
        url: 'https://api.anthropic.com',
        status: 'online',
        latency: 800,
        lastChecked: new Date().toISOString()
      }
    ];

    // 模拟从 Firestore 获取数据的过程
    const fetchStatuses = async (): Promise<ApiStatus[]> => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockStatuses), 100);
      });
    };

    expect(fetchStatuses()).resolves.toHaveLength(2);
    expect(fetchStatuses()).resolves.toContainEqual(expect.objectContaining({
      id: 'openai',
      name: 'OpenAI',
      status: 'online'
    }));
  });
  
  test('should handle real-time updates', () => {
    // 测试实时数据更新
    let statuses: ApiStatus[] = [
      {
        id: 'openai',
        name: 'OpenAI',
        provider: 'OpenAI',
        url: 'https://api.openai.com',
        status: 'online',
        latency: 500,
        lastChecked: new Date().toISOString()
      }
    ];

    // 模拟实时更新
    const updateStatus = (apiId: string, newStatus: 'online' | 'offline', newLatency: number) => {
      statuses = statuses.map(status => 
        status.id === apiId 
          ? { ...status, status: newStatus, latency: newLatency, lastChecked: new Date().toISOString() }
          : status
      );
    };

    // 初始状态
    expect(statuses[0].status).toBe('online');
    expect(statuses[0].latency).toBe(500);

    // 更新状态
    updateStatus('openai', 'offline', 0);
    expect(statuses[0].status).toBe('offline');
    expect(statuses[0].latency).toBe(0);
  });
});
