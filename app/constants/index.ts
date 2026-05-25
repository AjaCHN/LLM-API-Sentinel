// app/constants/index.ts v2.6.0
export const LATENCY_THRESHOLD = 1500;
export const MAX_RETRIES = 2;
export const RETRY_DELAY = 1000;
export const MAX_CONCURRENT_REQUESTS = 5;
export const CHART_DATA_LIMIT = 50;
export const CHECK_INTERVAL = 5 * 60 * 1000;
export const GEO_INFO_EXPIRY = 24 * 60 * 60 * 1000;
export const CACHE_EXPIRY = 30 * 1000; // 30秒缓存

// 缓存策略常量
export const DEFAULT_CACHE_EXPIRY = 30 * 1000; // 默认缓存时间：30秒
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
  
  // China APIs
  { id: 'moonshot-v1', name: 'Kimi (Moonshot)', provider: 'Moonshot', url: 'https://api.moonshot.cn/v1/models' },
  { id: 'zhipu-glm-4', name: 'GLM-4 (Zhipu)', provider: 'ZhipuAI', url: 'https://open.bigmodel.cn/api/paas/v4/model_list' },
  { id: 'baichuan-2', name: 'Baichuan 2', provider: 'Baichuan', url: 'https://api.baichuan-ai.com/v1/models' },
  { id: 'qwen-max', name: 'Qwen Max (Ali)', provider: 'Alibaba', url: 'https://dashscope.aliyuncs.com/api/v1/models' },
  { id: 'hunyuan-pro', name: 'Hunyuan (Tencent)', provider: 'Tencent', url: 'https://hunyuan.tencentcloudapi.com' },
  { id: 'ernie-4', name: 'Ernie 4.0 (Baidu)', provider: 'Baidu', url: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', url: 'https://api.deepseek.com/models' }
];

// 从本地存储读取 API 配置
export const APIS_TO_CHECK = (() => {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_APIS;
  }
  try {
    const savedConfig = localStorage.getItem('apiConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (error) {
    console.error('Failed to load API config:', error);
  }
  return DEFAULT_APIS;
})();
