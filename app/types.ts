// app/types.ts v2.5.0

// API 状态类型
export interface ApiStatus {
  id: string;
  name: string;
  provider: string;
  url: string;
  status: 'online' | 'offline';
  latency: number;
  lastChecked: string;
  error?: string;
  retries?: number;
  errorRate?: number;
  availability?: number;
}

// 图表数据点类型
export interface ChartDataPoint {
  time: string;
  [apiId: string]: number | string;
}

// 告警类型
export interface Alert {
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

// 状态历史类型
export interface StatusHistory {
  id: string;
  apiId: string;
  status: 'online' | 'offline';
  latency: number;
  timestamp: Date | string;
  time?: string;
  error?: string;
  retries?: number;
}

// API 检查结果类型
export interface ApiCheckResult {
  id: string;
  name: string;
  provider: string;
  url: string;
  status: 'online' | 'offline';
  latency: number;
  lastChecked: string;
  error?: string;
  retries?: number;
  errorRate?: number;
  availability?: number;
  uptime?: number;
  averageLatency?: number;
  maxLatency?: number;
  minLatency?: number;
}

// API 检查缓存类型
export interface ApiCheckCache {
  [apiId: string]: {
    result: ApiCheckResult;
    timestamp: number;
    expiry: number;
  };
}

// 网络质量类型
export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor';

// 请求选项类型
export interface RequestOptions {
  priority?: 'high' | 'medium' | 'low';
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  [key: string]: any;
}

// 队列项类型
export interface QueueItem<T> {
  fn: () => Promise<T>;
  options: RequestOptions;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
  timestamp: number;
}

// 并发状态类型
export interface ConcurrencyStatus {
  queueLength: number;
  activeRequests: number;
  concurrencyLimit: number;
  networkQuality: NetworkQuality;
}

// 应用错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

// 通知类型
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
  duration: number;
  dismissible: boolean;
}
