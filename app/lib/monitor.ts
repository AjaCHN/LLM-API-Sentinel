// app/lib/monitor.ts v2.4.2
export const APIS_TO_CHECK = [
  // US APIs
  { id: 'openai-gpt-4o', name: 'GPT-4o', provider: 'OpenAI', url: 'https://api.openai.com/v1/models' },
  { id: 'anthropic-claude-3-5', name: 'Claude 3.5', provider: 'Anthropic', url: 'https://api.anthropic.com/v1/messages' },
  { id: 'google-gemini-1-5', name: 'Gemini 1.5', provider: 'Google', url: 'https://generativelanguage.googleapis.com/v1beta/models' },
  { id: 'meta-llama-3', name: 'Llama 3 (Groq)', provider: 'Meta', url: 'https://api.groq.com/openai/v1/models' },
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', url: 'https://api.mistral.ai/v1/models' },
  { id: 'cohere-command', name: 'Command R+', provider: 'Cohere', url: 'https://api.cohere.ai/v1/models' },
  { id: 'perplexity-llama-3', name: 'Perplexity Llama 3', provider: 'Perplexity', url: 'https://api.perplexity.ai/v1/models' },
  { id: 'ai21-jurassic-2', name: 'Jurassic-2', provider: 'AI21', url: 'https://api.ai21.com/studio/v1/models' },
  { id: 'stability-stable-diffusion', name: 'Stable Diffusion', provider: 'Stability AI', url: 'https://api.stability.ai/v1/models' },
  { id: 'runway-gen-2', name: 'Gen-2', provider: 'Runway ML', url: 'https://api.runwayml.com/v1/models' },
  
  // China APIs
  { id: 'moonshot-v1', name: 'Kimi (Moonshot)', provider: 'Moonshot', url: 'https://api.moonshot.cn/v1/models' },
  { id: 'zhipu-glm-4', name: 'GLM-4 (Zhipu)', provider: 'ZhipuAI', url: 'https://open.bigmodel.cn/api/paas/v4/model_list' },
  { id: 'baichuan-2', name: 'Baichuan 2', provider: 'Baichuan', url: 'https://api.baichuan-ai.com/v1/models' },
  { id: 'qwen-max', name: 'Qwen Max (Ali)', provider: 'Alibaba', url: 'https://dashscope.aliyuncs.com/api/v1/models' },
  { id: 'hunyuan-pro', name: 'Hunyuan (Tencent)', provider: 'Tencent', url: 'https://hunyuan.tencentcloudapi.com' },
  { id: 'ernie-4', name: 'Ernie 4.0 (Baidu)', provider: 'Baidu', url: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', url: 'https://api.deepseek.com/models' }
];

export const LATENCY_THRESHOLD = 1500;
export const MAX_RETRIES = 2;
export const RETRY_DELAY = 1000;
export const CACHE_DURATION = 60000; // 1分钟缓存

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
}

// 缓存存储
const cache: Map<string, { data: ApiCheckResult; timestamp: number }> = new Map();

async function checkApi(api: typeof APIS_TO_CHECK[0], retries: number = 0): Promise<ApiCheckResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(api.url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - start;
    const isOnline = response.status < 500;
    
    if (!isOnline && retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return checkApi(api, retries + 1);
    }
    
    const result: ApiCheckResult = {
      ...api,
      status: isOnline ? 'online' : 'offline',
      latency,
      lastChecked: new Date().toISOString(),
      retries,
    };
    
    // 缓存结果
    cache.set(api.id, { data: result, timestamp: Date.now() });
    
    return result;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return checkApi(api, retries + 1);
    }
    
    const result: ApiCheckResult = {
      ...api,
      status: 'offline',
      latency: 0,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      retries,
    };
    
    // 缓存结果
    cache.set(api.id, { data: result, timestamp: Date.now() });
    
    return result;
  }
}

export async function performCheck(forceRefresh: boolean = false) {
  // 限制并发请求数量，避免过多同时请求
  const MAX_CONCURRENT = 5;
  const results: ApiCheckResult[] = [];
  
  for (let i = 0; i < APIS_TO_CHECK.length; i += MAX_CONCURRENT) {
    const batch = APIS_TO_CHECK.slice(i, i + MAX_CONCURRENT);
    const batchResults = await Promise.all(batch.map(async (api) => {
      // 检查缓存
      if (!forceRefresh) {
        const cached = cache.get(api.id);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
          return cached.data;
        }
      }
      // 缓存过期或强制刷新，重新检查
      return checkApi(api);
    }));
    results.push(...batchResults);
  }
  
  return results;
}

// 获取缓存的结果（如果存在且未过期）
export function getCachedResult(apiId: string): ApiCheckResult | null {
  const cached = cache.get(apiId);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

// 清除所有缓存
export function clearCache(): void {
  cache.clear();
}
