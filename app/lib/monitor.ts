// app/lib/monitor.ts v2.0.0
export const APIS_TO_CHECK = [
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

export const LATENCY_THRESHOLD = 1500;

export async function performCheck() {
  const results = await Promise.all(
    APIS_TO_CHECK.map(async (api) => {
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
        
        return {
          ...api,
          status: isOnline ? 'online' : 'offline',
          latency,
          lastChecked: new Date().toISOString(),
        };
      } catch (error) {
        return {
          ...api,
          status: 'offline',
          latency: 0,
          lastChecked: new Date().toISOString(),
        };
      }
    })
  );
  return results;
}
