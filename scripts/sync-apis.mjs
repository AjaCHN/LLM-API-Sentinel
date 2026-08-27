// scripts/sync-apis.mjs v2.10.27
// 将前端 API 单一真源 app/constants/apis.json 同步到 Supabase Edge Function，
// 避免后台探测目标（apis.json）与前端的 DEFAULT_APIS 出现双源漂移。
//
// 用法：
//   node scripts/sync-apis.mjs            # 复制并更新目标
//   node scripts/sync-apis.mjs --check    # 仅校验一致性（CI 用），不一致则非零退出
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const src = resolve(root, 'app/constants/apis.json');
const dest = resolve(root, 'supabase/functions/monitor/apis.json');

const source = JSON.parse(readFileSync(src, 'utf8'));

function normalize(list) {
  return JSON.stringify(list.map((a) => ({ id: a.id, name: a.name, provider: a.provider, url: a.url })), null, 2) + '\n';
}

const sourceText = normalize(source);

if (process.argv.includes('--check')) {
  if (!existsSync(dest)) {
    console.error('[sync-apis] 目标缺失: supabase/functions/monitor/apis.json 未生成，请运行 node scripts/sync-apis.mjs');
    process.exit(1);
  }
  const target = JSON.parse(readFileSync(dest, 'utf8'));
  if (normalize(target) !== sourceText) {
    console.error('[sync-apis] 不一致: Edge Function 的 apis.json 与前端单一真源脱节，请运行 node scripts/sync-apis.mjs');
    process.exit(1);
  }
  console.log(`[sync-apis] 一致: ${source.length} 个 API 已对齐`);
  process.exit(0);
}

writeFileSync(dest, sourceText, 'utf8');
console.log(`[sync-apis] 已同步 ${source.length} 个 API 到 supabase/functions/monitor/apis.json`);
