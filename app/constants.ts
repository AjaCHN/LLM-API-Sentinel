// app/constants.ts v2.5.0

// 延迟阈值（毫秒）
export const LATENCY_THRESHOLD = 1500;

// 图表数据点限制
export const CHART_DATA_LIMIT = 50;

// 缓存过期时间（毫秒）
export const CACHE_EXPIRY = 30000;
export const DEFAULT_CACHE_EXPIRY = 30000;
export const MIN_CACHE_EXPIRY = 10000;
export const MAX_CACHE_EXPIRY = 60000;

// 地理信息缓存过期时间（毫秒）
export const GEO_INFO_EXPIRY = 86400000;

// 检查间隔（毫秒）
export const CHECK_INTERVAL = 300000;

// 最大并发请求数
export const MAX_CONCURRENT_REQUESTS = 5;

// 重试配置
export const MAX_RETRIES = 2;
export const RETRY_DELAY = 1000;

// API 列表
export const APIS_TO_CHECK = [
  {
    id: 'openai',
    name: 'OpenAI',
    provider: 'OpenAI',
    url: 'https://api.openai.com/v1/models',
    region: 'us',
    category: 'general'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    provider: 'Anthropic',
    url: 'https://api.anthropic.com/v1/models',
    region: 'us',
    category: 'general'
  },
  {
    id: 'google',
    name: 'Google',
    provider: 'Google',
    url: 'https://generativelanguage.googleapis.com/v1/models',
    region: 'us',
    category: 'general'
  }
];
