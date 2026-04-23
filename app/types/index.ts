// app/types/index.ts v2.5.0
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
  uptime?: number;
}

export interface StatusHistory {
  apiId: string;
  status: 'online' | 'offline';
  latency: number;
  timestamp: Date;
  time: string;
}

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

export interface ChartDataPoint {
  time: string;
  [apiId: string]: number | string;
}

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
}

export interface ApiMetrics {
  apiId: string;
  errorRate: number;
  availability: number;
  uptime: number;
  totalChecks: number;
  failedChecks: number;
  lastUpdated: string;
}
