// supabase/functions/monitor/index.ts v2.10.27
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
//   - 探测目标为白名单（apis.json），不接受外部 URL 参数，防止 SSRF。
//   - apis.json 由 scripts/sync-apis.mjs 从前端单一真源 app/constants/apis.json 同步，
//     确保后台探测目标与前端 DEFAULT_APIS 永远一致。

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

/** 读取探测目标白名单（与前端 app/constants/apis.json 同步） */
async function loadApisToCheck(): Promise<ApiProbe[]> {
  const raw = await Deno.readTextFile('apis.json');
  const parsed = JSON.parse(raw) as ApiProbe[];
  return parsed.filter(
    (a) => typeof a.id === 'string' && typeof a.url === 'string' && a.url.startsWith('https://')
  );
}

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

  const APIS_TO_CHECK = await loadApisToCheck();
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
