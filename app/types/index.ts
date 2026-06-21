// app/types/index.ts v2.6.3
// API 状态接口
export interface ApiStatus {
  id: string;
  name: string;
  provider: string;
  url: string;
  status: 'online' | 'offline' | 'degraded';
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

// 状态历史记录接口
export interface StatusHistory {
  id?: string;
  apiId: string;
  status: 'online' | 'offline' | 'degraded';
  latency: number;
  timestamp: Date;
  time: string;
  error?: string;
  retries?: number;
}

// 告警接口
export interface Alert {
  id: string;
  apiId: string;
  apiName: string;
  type: 'downtime' | 'latency' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date | string | number;
  resolved: boolean;
  error?: string;
  retries?: number;
  latency?: number;
  resolvedAt?: Date;
  resolvedBy?: string;
}

// 图表数据点接口
export interface ChartDataPoint {
  time: string;
  [apiId: string]: number | string;
}

// API 检查结果接口
export type ApiCheckResult = ApiStatus;

// API 指标接口
export interface ApiMetrics {
  apiId?: string;
  errorRate: number;
  availability: number;
  uptime: number;
  totalChecks: number;
  failedChecks: number;
  lastUpdated?: string;
  averageLatency: number;
  maxLatency: number;
  minLatency: number;
  responseTimeTrend?: number[];
}

// 缓存接口
export interface ApiCheckCache {
  [apiId: string]: {
    result: ApiCheckResult;
    timestamp: number;
    expiry: number;
  };
}

// 地理位置接口
export interface GeoLocation {
  city: string;
  country: string;
  ip?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

// 并发请求选项接口
export interface RequestOptions {
  priority?: 'low' | 'medium' | 'high';
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  [key: string]: unknown;
}

// 队列项接口
export interface QueueItem<T> {
  fn: () => Promise<T>;
  options: RequestOptions;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
  timestamp: number;
}

// 网络质量接口
export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor';

// 并发状态接口
export interface ConcurrencyStatus {
  queueLength: number;
  activeRequests: number;
  concurrencyLimit: number;
  networkQuality: NetworkQuality;
}

// API 配置接口
export interface ApiConfig {
  id: string;
  name: string;
  provider: string;
  url: string;
  enabled?: boolean;
  checkInterval?: number;
  timeout?: number;
}

// 用户接口
export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  providerId?: string;
}

// 错误接口
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: number;
}

// 通知接口
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
  duration?: number;
  dismissible?: boolean;
}
