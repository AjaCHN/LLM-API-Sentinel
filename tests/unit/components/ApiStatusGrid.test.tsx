// tests/unit/components/ApiStatusGrid.test.tsx
import { describe, test, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ApiStatusGrid from '../../../app/components/ApiStatusGrid';

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

describe('ApiStatusGrid', () => {
  test('should render status cards correctly', () => {
    // 测试状态网格渲染
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

    render(<ApiStatusGrid statuses={mockStatuses} />);

    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
    expect(screen.getByText('online')).toBeInTheDocument();
  });
  
  test('should display offline status correctly', () => {
    // 测试离线状态显示
    const mockStatuses: ApiStatus[] = [
      {
        id: 'openai',
        name: 'OpenAI',
        provider: 'OpenAI',
        url: 'https://api.openai.com',
        status: 'offline',
        latency: 0,
        lastChecked: new Date().toISOString(),
        error: 'Connection failed'
      }
    ];

    render(<ApiStatusGrid statuses={mockStatuses} />);

    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('offline')).toBeInTheDocument();
  });
});
