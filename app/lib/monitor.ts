// app/lib/monitor.ts v3.4.7
import axios from 'axios';
import { getApiConfig } from './config';

export interface ApiConfig {
  id: string;
  name: string;
  provider: string;
  url: string;
  interval: number; // in milliseconds
  strategy: 'ping' | 'full';
  method?: string;
  body?: any;
  customBody?: string; // JSON string
  timeout?: number; // in milliseconds
  headers?: any;
  region?: string;
}

export const REGIONS = [
  { id: 'na', name: 'North America', baseLatency: 20 },
  { id: 'eu', name: 'Europe', baseLatency: 120 },
  { id: 'asia', name: 'Asia', baseLatency: 200 }
];

export const APIS_TO_CHECK: ApiConfig[] = [
  // US APIs
  { id: 'openai-gpt-4o', name: 'GPT-4o', provider: 'OpenAI', url: 'https://api.openai.com/v1/models', interval: 60000, strategy: 'ping' },
  { id: 'anthropic-claude-3-5', name: 'Claude 3.5', provider: 'Anthropic', url: 'https://api.anthropic.com/v1/messages', interval: 300000, strategy: 'full', method: 'POST', body: { messages: [{ role: 'user', content: 'ping' }] } },
  { id: 'google-gemini-1-5', name: 'Gemini 1.5', provider: 'Google', url: 'https://generativelanguage.googleapis.com/v1beta/models', interval: 60000, strategy: 'ping' },
  { id: 'meta-llama-3', name: 'Llama 3 (Groq)', provider: 'Meta', url: 'https://api.groq.com/openai/v1/models', interval: 300000, strategy: 'ping' },
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', url: 'https://api.mistral.ai/v1/models', interval: 900000, strategy: 'ping' },
  
  // China APIs
  { id: 'moonshot-v1', name: 'Kimi (Moonshot)', provider: 'Moonshot', url: 'https://api.moonshot.cn/v1/models', interval: 60000, strategy: 'ping' },
  { id: 'zhipu-glm-4', name: 'GLM-4 (Zhipu)', provider: 'ZhipuAI', url: 'https://open.bigmodel.cn/api/paas/v4/model_list', interval: 300000, strategy: 'ping' },
  { id: 'baichuan-2', name: 'Baichuan 2', provider: 'Baichuan', url: 'https://api.baichuan-ai.com/v1/models', interval: 60000, strategy: 'ping' },
  { id: 'qwen-max', name: 'Qwen Max (Ali)', provider: 'Alibaba', url: 'https://dashscope.aliyuncs.com/api/v1/models', interval: 300000, strategy: 'ping' },
  { id: 'hunyuan-pro', name: 'Hunyuan (Tencent)', provider: 'Tencent', url: 'https://hunyuan.tencentcloudapi.com', interval: 900000, strategy: 'ping' },
  { id: 'ernie-4', name: 'Ernie 4.0 (Baidu)', provider: 'Baidu', url: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions', interval: 60000, strategy: 'ping' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', url: 'https://api.deepseek.com/models', interval: 300000, strategy: 'ping' }
];

export const LATENCY_THRESHOLD = 1500;

export async function performCheck(api: ApiConfig, regionId: string = 'na') {
  const config = await getApiConfig(api.id);
  const effectiveApi = config ? { ...api, ...config } : api;
  const region = REGIONS.find(r => r.id === regionId) || REGIONS[0];
  
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), effectiveApi.timeout || 6000);

    const options: RequestInit = {
      method: effectiveApi.strategy === 'full' && effectiveApi.method ? effectiveApi.method : 'GET',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(effectiveApi.headers || {}) },
    };

    if (effectiveApi.strategy === 'full') {
      options.body = effectiveApi.customBody || JSON.stringify(effectiveApi.body);
    }

    const response = await fetch(effectiveApi.url, options);
    
    clearTimeout(timeoutId);
    
    // Simulate regional latency
    const simulatedLatency = (Date.now() - start) + region.baseLatency + Math.floor(Math.random() * 50);
    const isOnline = response.status < 500;
    
    // Calculate pseudo throughput (requests per second)
    const throughput = isOnline ? parseFloat((1000 / (simulatedLatency || 1)).toFixed(2)) : 0;
    
    return {
      ...effectiveApi,
      id: `${effectiveApi.id}-${regionId}`, // Unique ID for region
      originalId: effectiveApi.id,
      region: regionId,
      status: isOnline ? 'online' : 'offline',
      latency: simulatedLatency,
      throughput,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ...effectiveApi,
      id: `${effectiveApi.id}-${regionId}`,
      originalId: effectiveApi.id,
      region: regionId,
      status: 'offline',
      latency: 0,
      throughput: 0,
      lastChecked: new Date().toISOString(),
    };
  }
}

