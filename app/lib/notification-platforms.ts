// app/lib/notification-platforms.ts v2.9.6
import { logError } from './error-handler';
import type { WebhookConfig } from './notification';
import { formatAlert, type WebhookBody } from './webhook-formatter';

export { formatAlert };
export type { WebhookBody };

// 单条 webhook 正文最大长度，超出截断避免超大 payload
const MAX_WEBHOOK_TEXT_LENGTH = 2000;

/** 基础 SSRF 防护：拒绝明显指向内网/环回地址的 webhook host。 */
const PRIVATE_HOST_PREFIXES = [
  'localhost', '127.', '10.', '192.168.',
  '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.', '172.22.',
  '172.23.', '172.24.', '172.25.', '172.26.', '172.27.', '172.28.', '172.29.',
  '172.30.', '172.31.', '169.254.', '0.', '::1', 'fc00:', 'fe80:'
];

/** 将十进制/十六进制/八进制等编码形式归一化为点分 IPv4 前缀（如 2130706433→127.0.0.1） */
function normalizeIpEncoding(host: string): string {
  const trimmed = host.split(':')[0]; // 去掉端口
  if (/^\d{1,12}$/.test(trimmed)) {
    const n = Number(trimmed);
    if (n >= 0 && n <= 0xffffffff) {
      return [
        (n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff
      ].join('.');
    }
  }
  if (/^0x[0-9a-f]+$/i.test(trimmed)) {
    const n = parseInt(trimmed, 16);
    if (n >= 0 && n <= 0xffffffff) {
      return [
        (n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff
      ].join('.');
    }
  }
  return host;
}

export function isPrivateWebhookHost(url: string): boolean {
  try {
    const rawHost = new URL(url).hostname.toLowerCase();
    const host = normalizeIpEncoding(rawHost);
    return PRIVATE_HOST_PREFIXES.some(
      (prefix) => host === prefix || host.startsWith(prefix) || host.endsWith('.' + prefix)
    );
  } catch {
    // 无法解析的 URL 视为不安全，拒绝发送
    return true;
  }
}

/** 从 webhook URL 推断平台类型（支持多渠道：Slack / Teams / Discord / 钉钉 / 飞书 / 通用） */
export function detectPlatform(
  url: string
): 'slack' | 'teams' | 'dingtalk' | 'feishu' | 'discord' | 'generic' {
  if (url.includes('hooks.slack.com')) return 'slack';
  if (url.includes('office.com') || url.includes('webhook.office.com')) return 'teams';
  if (url.includes('oapi.dingtalk.com') || url.includes('dingtalk')) return 'dingtalk';
  if (url.includes('open.feishu.cn') || url.includes('feishu')) return 'feishu';
  if (url.includes('discord')) return 'discord';
  return 'generic';
}

/** 发送单条 webhook POST，带超时/中止与 SSRF 防护 */
export async function sendWebhookRequest(
  config: WebhookConfig,
  payload: WebhookBody
): Promise<boolean> {
  // SSRF 防护：拒绝发往内网/环回地址的 webhook
  if (isPrivateWebhookHost(config.url)) {
    logError(new Error(`Blocked webhook to private/internal host: ${config.url}`), 'Webhook SSRF guard');
    return false;
  }

  const timeout = config.timeout || 5000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const body = JSON.stringify(payload);
    // 性能/安全: 截断超大正文，避免请求体过大被网关拒绝
    const truncatedBody = body.length > MAX_WEBHOOK_TEXT_LENGTH
      ? body.slice(0, MAX_WEBHOOK_TEXT_LENGTH)
      : body;

    const response = await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: truncatedBody,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      logError(new Error(`Webhook request failed with status ${response.status}`), 'Webhook request failed');
      return false;
    }
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logError(new Error(`Webhook request timed out after ${timeout}ms`), 'Webhook timeout');
    } else {
      logError(error, 'Webhook request failed');
    }
    return false;
  }
}
