// app/constants/index.ts v2.9.4
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

// 默认 API 配置
const DEFAULT_APIS = [
  // US APIs
  { id: 'openai-gpt-4o', name: 'GPT-4o', provider: 'OpenAI', url: 'https://api.openai.com/v1/models' },
  { id: 'anthropic-claude-3-5', name: 'Claude 3.5', provider: 'Anthropic', url: 'https://api.anthropic.com/v1/messages' },
  { id: 'google-gemini-1-5', name: 'Gemini 1.5', provider: 'Google', url: 'https://generativelanguage.googleapis.com/v1beta/models' },
  { id: 'meta-llama-3', name: 'Llama 3 (Groq)', provider: 'Meta', url: 'https://api.groq.com/openai/v1/models' },
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', url: 'https://api.mistral.ai/v1/models' },
  { id: 'xai-grok', name: 'Grok (xAI)', provider: 'xAI', url: 'https://api.x.ai/v1/models' },
  { id: 'cohere-command', name: 'Command R (Cohere)', provider: 'Cohere', url: 'https://api.cohere.ai/v1/models' },
  { id: 'perplexity-sonar', name: 'Sonar (Perplexity)', provider: 'Perplexity', url: 'https://api.perplexity.ai/models' },
  { id: 'together-llama', name: 'Llama (Together)', provider: 'Together AI', url: 'https://api.together.xyz/v1/models' },
  { id: 'replicate', name: 'Replicate', provider: 'Replicate', url: 'https://api.replicate.com/v1/models' },
  { id: 'stability-ai', name: 'Stability AI', provider: 'Stability AI', url: 'https://api.stability.ai/v1/models' },
  { id: 'huggingface', name: 'Hugging Face', provider: 'HuggingFace', url: 'https://api-inference.huggingface.co/models' },
  { id: 'openrouter', name: 'OpenRouter', provider: 'OpenRouter', url: 'https://openrouter.ai/api/v1/models' },
  { id: 'fireworks', name: 'Fireworks AI', provider: 'Fireworks', url: 'https://api.fireworks.ai/inference/v1/models' },
  { id: 'nvidia-nim', name: 'NVIDIA NIM', provider: 'NVIDIA', url: 'https://integrate.api.nvidia.com/v1/models' },
  { id: 'ai21', name: 'AI21 Labs', provider: 'AI21', url: 'https://api.ai21.com/studio/v1/chat/completions' },

  // China APIs
  { id: 'moonshot-v1', name: 'Kimi (Moonshot)', provider: 'Moonshot', url: 'https://api.moonshot.cn/v1/models' },
  { id: 'zhipu-glm-4', name: 'GLM-4 (Zhipu)', provider: 'ZhipuAI', url: 'https://open.bigmodel.cn/api/paas/v4/model_list' },
  { id: 'baichuan-2', name: 'Baichuan 2', provider: 'Baichuan', url: 'https://api.baichuan-ai.com/v1/models' },
  { id: 'qwen-max', name: 'Qwen Max (Ali)', provider: 'Alibaba', url: 'https://dashscope.aliyuncs.com/api/v1/models' },
  { id: 'hunyuan-pro', name: 'Hunyuan (Tencent)', provider: 'Tencent', url: 'https://hunyuan.tencentcloudapi.com' },
  { id: 'ernie-4', name: 'Ernie 4.0 (Baidu)', provider: 'Baidu', url: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', url: 'https://api.deepseek.com/models' },
  { id: 'minimax', name: 'MiniMax', provider: 'MiniMax', url: 'https://api.minimax.chat/v1/models' },
  { id: 'iflytek-spark', name: 'Spark (iFlytek)', provider: 'iFlytek', url: 'https://spark-api.xf-yun.com/v1/chat/completions' },
  { id: 'doubao', name: 'Doubao (Volcano)', provider: 'ByteDance', url: 'https://ark.cn-beijing.volces.com/api/v3/models' },
  { id: 'yi-01', name: 'Yi (01.AI)', provider: '01.AI', url: 'https://api.lingyiwanwu.com/v1/models' },
  { id: 'siliconflow', name: 'SiliconFlow', provider: 'SiliconFlow', url: 'https://api.siliconflow.cn/v1/models' },
  { id: 'stepfun', name: 'StepFun', provider: 'StepFun', url: 'https://api.stepfun.com/v1/models' }
];

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
