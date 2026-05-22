// app/lib/utils.ts v2.5.1
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiColor(id: string) {
  const colors: Record<string, string> = {
    'openai-gpt-4o': '#10a37f',
    'anthropic-claude-3-5': '#d97757',
    'google-gemini-1-5': '#4285f4',
    'meta-llama-3': '#0668E1',
    'mistral-large': '#F5D140',
    'moonshot-v1': '#FF5C00',
    'zhipu-glm-4': '#3B82F6',
    'baichuan-2': '#EF4444',
    'qwen-max': '#8B5CF6',
    'hunyuan-pro': '#0052D9',
    'ernie-4': '#2932E1',
    'deepseek-v3': '#6366f1'
  };
  return colors[id] || '#141414';
}
