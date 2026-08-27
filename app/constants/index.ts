// app/constants/index.ts v2.10.27
import apisData from './apis.json';
import type { ApiConfig } from '@/types';
export const LATENCY_THRESHOLD = 1500;
export const DEGRADED_THRESHOLD = 1000;
export const MAX_RETRIES = 2;
export const RETRY_DELAY = 1000;
export const MAX_CONCURRENT_REQUESTS = 5;
export const CHART_DATA_LIMIT = 50;
export const CHECK_INTERVAL = 5 * 60 * 1000;
export const GEO_INFO_EXPIRY = 24 * 60 * 60 * 1000;
export const CACHE_EXPIRY = 30 * 1000; // 默认缓存时间：30秒
export const MIN_CACHE_EXPIRY = 5 * 1000; // 最小缓存时间：5秒
export const MAX_CACHE_EXPIRY = 60 * 1000; // 最大缓存时间：1分钟

// 默认 API 配置（单一真源：apis.json，前端与 Supabase Edge Function 共享）
const DEFAULT_APIS = apisData as ApiConfig[];

// Schema 校验 API 配置项
function isValidApiConfigItem(item: unknown): item is { id: string; name: string; provider: string; url: string } {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === 'string' && obj.id.trim().length > 0 &&
    typeof obj.name === 'string' && obj.name.trim().length > 0 &&
    typeof obj.provider === 'string' && obj.provider.trim().length > 0 &&
    typeof obj.url === 'string' && obj.url.startsWith('https://')
  );
}

// 从本地存储读取 API 配置
export const APIS_TO_CHECK = (() => {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_APIS;
  }
  try {
    const savedConfig = localStorage.getItem('apiConfig');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      if (Array.isArray(parsed) && parsed.every(isValidApiConfigItem)) {
        return parsed;
      }
      // 配置格式无效，清除并回退到默认
      localStorage.removeItem('apiConfig');
    }
  } catch (error) {
    // 静默忽略配置加载错误，使用默认配置
  }
  return DEFAULT_APIS;
})();
