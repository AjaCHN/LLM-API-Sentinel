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
