-- supabase/cron.sql v2.9.6
-- 后台监控定时调度示例：每 5 分钟触发 monitor Edge Function。
--
-- 使用方法（在 Supabase SQL Editor 执行本文件）：
--   1) 已通过 `supabase functions deploy monitor --no-verify-jwt` 部署 monitor 函数
--   2) 在 Supabase 控制台 -> Database -> Extensions 启用 `pg_cron`（共享托管默认开启）
--   3) 执行本 SQL 注册定时任务
--
-- 安全说明：
--   - pg_cron 任务在数据库内部执行，调用 auth 服务触发 Edge Function（受信任路径）。
--   - 若 monitor 使用 --no-verify-jwt 暴露，建议额外在函数中校验 `Authorization` 签名头，
--     避免被公网任意调用。

-- 启用 pg_cron 扩展（如尚未启用）
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 删除旧任务（幂等，便于重复执行更新调度）
SELECT cron.unschedule('monitor-llm-apis') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'monitor-llm-apis'
);

-- 每 5 分钟调用一次 monitor Edge Function
-- 注意：cron 触发时由 Supabase 内部调用函数 endpoint，无需外网暴露。
SELECT cron.schedule(
  'monitor-llm-apis',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_functions_endpoint') || '/monitor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}',
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- 可选：若使用独立监控模式（不依赖 net 扩展），也可改为在 monitor 内部由 cron 直接调用。
-- 下方为数据保留策略示例：删除 90 天前的 status_history 明细，控制存储成本。
-- （取消注释以启用）
-- DELETE FROM status_history
-- WHERE timestamp < NOW() - INTERVAL '90 days';
