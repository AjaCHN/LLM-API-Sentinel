// app/lib/utils.ts v2.7.0
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// API 颜色映射 - 使用 Map 提高性能
const API_COLOR_MAP = new Map([
  ['openai-gpt-4o', '#10a37f'],
  ['anthropic-claude-3-5', '#d97757'],
  ['google-gemini-1-5', '#4285f4'],
  ['meta-llama-3', '#0668E1'],
  ['mistral-large', '#F5D140'],
  ['moonshot-v1', '#FF5C00'],
  ['zhipu-glm-4', '#3B82F6'],
  ['baichuan-2', '#EF4444'],
  ['qwen-max', '#8B5CF6'],
  ['hunyuan-pro', '#0052D9'],
  ['ernie-4', '#2932E1'],
  ['deepseek-v3', '#6366f1']
]);

export function getApiColor(id: string) {
  return API_COLOR_MAP.get(id) || '#141414';
}

// 状态样式辅助函数
export type ApiStatusType = 'online' | 'offline' | 'degraded';

export function getStatusColor(status: ApiStatusType): string {
  switch (status) {
    case 'online': return 'bg-emerald-500';
    case 'degraded': return 'bg-amber-500';
    case 'offline': return 'bg-destructive';
    default: return 'bg-muted';
  }
}

export function getStatusPulseColor(status: ApiStatusType): string {
  switch (status) {
    case 'online': return 'shadow-[0_0_12px_rgba(34,197,94,0.6)]';
    case 'degraded': return 'shadow-[0_0_12px_rgba(245,158,11,0.6)]';
    case 'offline': return 'shadow-[0_0_12px_rgba(239,68,68,0.6)]';
    default: return '';
  }
}

export function getLatencyColor(latency: number, threshold: number, isOffline: boolean): string {
  if (isOffline) return 'text-destructive';
  if (latency >= threshold) return 'text-amber-500';
  return 'text-emerald-400';
}

export function getProgressBarVariant(latency: number, threshold: number, isOffline: boolean): 'success' | 'warning' | 'danger' {
  if (isOffline) return 'danger';
  if (latency >= threshold) return 'warning';
  return 'success';
}
