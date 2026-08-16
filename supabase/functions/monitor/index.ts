// supabase/functions/monitor/index.ts v2.9.9
// 后台监控 Edge Function 示例：由 Supabase Cron 每 5 分钟触发，
// 探测一组 LLM API 的连通性与延迟，并将结果写入 api_status 与 status_history。
//
// 部署：
//   supabase functions deploy monitor --no-verify-jwt
// 环境变量 (Edge Function secrets)：
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY（由 supabase 自动注入，无需手动设置）
//
// 安全说明：
//   - 使用 service_role key 写入，绕过 RLS；仅应在受信任的后端调度中调用。
//   - 通过 --no-verify-jwt 暴露，但应配合 Cron 的受信任调用或额外签名校验。
//   - 探测目标为硬编码白名单，不接受外部 URL 参数，防止 SSRF。

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 探测目标白名单（与前端 app/constants/index.ts 的 DEFAULT_APIS 保持一致）
const APIS_TO_CHECK: { id: string; name: string; provider: string; url: string }[] = [
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
  { id: 'stepfun', name: 'StepFun', provider: 'StepFun', url: 'https://api.stepfun.com/v1/models' },
];

const DEGRADED_THRESHOLD = 1000;
const PROBE_TIMEOUT_MS = 6000;

type ApiProbe = { id: string; name: string; provider: string; url: string };
type ProbeResult = {
  id: string;
  name: string;
  provider: string;
  url: string;
  status: 'online' | 'offline' | 'degraded';
  latency: number;
  error: string | null;
};

/** 探测单个 API，返回结构化结果（不抛异常） */
async function probeApi(api: ApiProbe): Promise<ProbeResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    const response = await fetch(api.url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latency = Date.now() - start;
    const isOnline = response.status < 500;
    const status: ProbeResult['status'] = !isOnline
      ? 'offline'
      : latency > DEGRADED_THRESHOLD
        ? 'degraded'
        : 'online';

    return { ...api, status, latency, error: isOnline ? null : `HTTP ${response.status}` };
  } catch (err) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : 'Request failed';
    return { ...api, status: 'offline', latency: 0, error: message };
  }
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const results = await Promise.all(APIS_TO_CHECK.map(probeApi));
  const now = new Date().toISOString();

  // 写入 api_status（upsert by id）
  const statusRows = results.map((r) => ({
    id: r.id,
    name: r.name,
    provider: r.provider,
    url: r.url,
    status: r.status,
    latency: r.latency,
    error: r.error,
    last_checked: now,
  }));
  const { error: upsertError } = await supabase.from('api_status').upsert(statusRows);
  if (upsertError) {
    return new Response(JSON.stringify({ error: upsertError.message }), { status: 500 });
  }

  // 写入 status_history（每次探测一条明细）
  const historyRows = results.map((r) => ({
    api_id: r.id,
    status: r.status,
    latency: r.latency,
    error: r.error,
    timestamp: now,
  }));
  const { error: insertError } = await supabase.from('status_history').insert(historyRows);
  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
  }

  const offline = results.filter((r) => r.status === 'offline').length;
  const degraded = results.filter((r) => r.status === 'degraded').length;

  return new Response(
    JSON.stringify({ ok: true, checked: results.length, offline, degraded, at: now }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});
