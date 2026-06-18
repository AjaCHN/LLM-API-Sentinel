// app/lib/supabase.ts v2.6.3
// 安全修复: 环境变量验证、URL 格式验证、HTTPS 强制、避免 SSR 副作用
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * 验证环境变量格式 (纯函数, 无副作用)
 */
export function validateSupabaseEnv(): { valid: boolean; reason?: string } {
  if (!supabaseUrl) {
    return { valid: false, reason: 'NEXT_PUBLIC_SUPABASE_URL is not set' };
  }
  if (!supabaseAnonKey) {
    return { valid: false, reason: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is not set' };
  }
  try {
    const parsed = new URL(supabaseUrl);
    if (parsed.protocol !== 'https:') {
      return { valid: false, reason: 'Supabase URL must use HTTPS protocol' };
    }
    if (!parsed.hostname.includes('.supabase.')) {
      return { valid: false, reason: 'URL does not appear to be a valid Supabase endpoint' };
    }
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }
  return { valid: true };
}

/**
 * 检查当前环境是否为浏览器 (客户端)
 */
const isBrowser = typeof window !== 'undefined';

/**
 * 仅在客户端控制台记录警告 (避免 SSR 日志污染和服务端副作用)
 */
if (isBrowser) {
  const envCheck = validateSupabaseEnv();
  if (!envCheck.valid) {
    console.warn(
      `[Supabase] ${envCheck.reason}. ` +
      `Application will use fallback mode. Features requiring Supabase will be unavailable.`
    );
  }
}

/**
 * 创建 Supabase 客户端实例
 */
export const supabase = validateSupabaseEnv().valid
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: { eventsPerSecond: 10 },
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

/**
 * 检查 Supabase 是否已配置 (供组件有条件地渲染 UI)
 */
export const isSupabaseConfigured = validateSupabaseEnv().valid;
