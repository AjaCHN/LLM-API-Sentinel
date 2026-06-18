// app/lib/supabase.ts v2.6.3
// 安全修复: 添加环境变量验证和降级策略
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 环境变量验证
function validateEnvironment(): boolean {
  const isValidUrl = supabaseUrl.length > 0 && 
    (supabaseUrl.startsWith('https://') || supabaseUrl.startsWith('http://'));
  const isValidKey = supabaseAnonKey.length > 0;
  
  return isValidUrl && isValidKey;
}

// 仅在客户端运行时验证 (避免 SSR 问题)
const isClient = typeof window !== 'undefined';

if (!validateEnvironment()) {
  if (isClient) {
    console.warn(
      '[Supabase] Environment variables missing or invalid. ' +
      'Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Application will use fallback mode with limited functionality.'
    );
  }
}

// 安全实践: 验证 URL 格式
function isValidSupabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

// 创建客户端 - 只有在环境变量有效时才创建真实的客户端
export const supabase = validateEnvironment() && isValidSupabaseUrl(supabaseUrl)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// 导出环境状态供组件检查
export const isSupabaseConfigured = validateEnvironment() && isValidSupabaseUrl(supabaseUrl);
