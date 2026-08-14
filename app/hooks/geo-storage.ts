// app/hooks/geo-storage.ts v2.8.2
// 地理位置相关的 localStorage 读写与结构校验，从 useGeoLocation 抽离以降低主文件体积
import { logError } from '../lib/error-handler';
import type { GeoLocation } from '../store';

const GEO_OPT_IN_KEY = 'geoOptIn';
const GEO_INFO_KEY = 'geoInfo';
const GEO_INFO_EXPIRY_KEY = 'geoInfoExpiry';

/**
 * 安全验证 GeoLocation 对象结构
 * 防止 localStorage 被篡改导致的类型错误或 XSS
 */
export function isValidGeoLocation(data: unknown): data is GeoLocation {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  // city 必须是非空字符串且长度受限
  if (typeof obj.city !== 'string' || !obj.city.trim()) return false;
  if (obj.city.length > 100) return false;

  // country 必须是非空字符串且长度受限
  if (typeof obj.country !== 'string' || !obj.country.trim()) return false;
  if (obj.country.length > 100) return false;

  // ip 可选，若存在必须是有效的 IP 格式
  if (obj.ip !== undefined) {
    if (typeof obj.ip !== 'string') return false;
    if (obj.ip.length > 45) return false; // IPv6 最大长度
    if (!/^[\d.:a-fA-F]+$/.test(obj.ip)) return false;
  }

  return true;
}

/** 安全地从 localStorage 读取 geoInfo，失败或无效则清除并返回 null。 */
export function getSafeGeoFromStorage(): GeoLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = window.localStorage.getItem(GEO_INFO_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (isValidGeoLocation(parsed)) {
      return parsed;
    }

    // 无效数据则清除
    clearGeoStorage();
    return null;
  } catch {
    // JSON 解析失败，清除无效数据
    clearGeoStorage();
    return null;
  }
}

/** 清除本地 geo 缓存。 */
export function clearGeoStorage(): void {
  try {
    window.localStorage.removeItem(GEO_INFO_KEY);
    window.localStorage.removeItem(GEO_INFO_EXPIRY_KEY);
  } catch {
    // ignore
  }
}

/** 读取 geoInfo 的过期时间戳。 */
export function getGeoExpiry(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const expiry = window.localStorage.getItem(GEO_INFO_EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  } catch {
    return null;
  }
}

/** 安全写入 geoInfo 及过期时间。 */
export function saveGeoStorage(geo: GeoLocation, expiry: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GEO_INFO_KEY, JSON.stringify(geo));
    window.localStorage.setItem(GEO_INFO_EXPIRY_KEY, String(expiry));
  } catch {
    // ignore
  }
}

/** 安全地从 localStorage 读取 opt-in 值。 */
export function getSafeOptInFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const val = window.localStorage.getItem(GEO_OPT_IN_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

/** 读写 opt-in 标记。 */
export function setOptInStorage(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GEO_OPT_IN_KEY, String(value));
  } catch {
    // ignore
  }
}

export { GEO_OPT_IN_KEY, logError };
