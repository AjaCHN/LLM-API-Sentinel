// app/lib/notification-platforms.ts v2.8.2
import { Alert } from '../types';
import { logError } from './error-handler';
import type { WebhookConfig } from './notification';

// Webhook 消息格式
interface WebhookPayload {
  msg_type: 'text' | 'markdown';
  content: {
    text?: string;
    markdown?: {
      title: string;
      text: string;
    };
  };
}

// DingTalk/Feishu 消息格式
interface DingTalkPayload {
  msgtype: 'text' | 'markdown';
  text?: { content: string };
  markdown?: { title: string; text: string };
}

// Discord 消息格式
interface DiscordPayload {
  embeds: Array<{
    title: string;
    description: string;
    color: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    timestamp?: string;
  }>;
}

// 单条 webhook 正文最大长度，超出截断避免超大 payload
const MAX_WEBHOOK_TEXT_LENGTH = 2000;

/** 基础 SSRF 防护：拒绝明显指向内网/环回地址的 webhook host。 */
const PRIVATE_HOST_PREFIXES = [
  'localhost',
  '127.',
  '10.',
  '192.168.',
  '172.16.',
  '172.17.',
  '172.18.',
  '172.19.',
  '172.20.',
  '172.21.',
  '172.22.',
  '172.23.',
  '172.24.',
  '172.25.',
  '172.26.',
  '172.27.',
  '172.28.',
  '172.29.',
  '172.30.',
  '172.31.',
  '169.254.',
  '0.',
  '::1',
  'fc00:',
  'fe80:'
];

export function isPrivateWebhookHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return PRIVATE_HOST_PREFIXES.some(
      (prefix) => host === prefix || host.startsWith(prefix) || host.endsWith('.' + prefix)
    );
  } catch {
    // 无法解析的 URL 视为不安全，拒绝发送
    return true;
  }
}

/** Detect platform type from webhook URL. */
export function detectPlatform(url: string): 'dingtalk' | 'feishu' | 'discord' | 'generic' {
  if (url.includes('oapi.dingtalk.com') || url.includes('dingtalk')) {
    return 'dingtalk';
  }
  if (url.includes('open.feishu.cn') || url.includes('feishu')) {
    return 'feishu';
  }
  if (url.includes('discord')) {
    return 'discord';
  }
  return 'generic';
}

/** Format an alert payload for the target platform. */
export function formatAlert(
  alert: Alert,
  platform: string
): WebhookPayload | DingTalkPayload | DiscordPayload {
  const normalizedTimestamp =
    alert.timestamp instanceof Date
      ? alert.timestamp
      : typeof alert.timestamp === 'number'
        ? new Date(alert.timestamp)
        : typeof alert.timestamp === 'string'
          ? new Date(alert.timestamp)
          : new Date();
  const timestamp = normalizedTimestamp.toLocaleString();

  const severityEmoji = {
    low: '🔵',
    medium: '🟡',
    high: '🟠',
    critical: '🔴'
  }[alert.severity] || '⚪';

  const statusEmoji = alert.type === 'downtime' ? '❌' : '⚠️';

  const baseInfo = {
    api: alert.apiName,
    type: alert.type === 'downtime' ? '服务下线' : '延迟过高',
    severity: alert.severity.toUpperCase(),
    message: alert.message,
    time: timestamp
  };

  if (platform === 'discord') {
    const colorMap: Record<string, number> = {
      low: 3447003, // 蓝色
      medium: 16776960, // 黄色
      high: 16744448, // 橙色
      critical: 16724788 // 红色
    };

    return {
      embeds: [{
        title: `${severityEmoji} ${baseInfo.type} - ${baseInfo.api}`,
        description: baseInfo.message,
        color: colorMap[alert.severity] || 0,
        fields: [
          { name: '严重程度', value: baseInfo.severity, inline: true },
          { name: '类型', value: baseInfo.type, inline: true },
          ...(alert.latency ? [{ name: '延迟', value: `${alert.latency}ms`, inline: true }] : []),
          ...(alert.error ? [{ name: '错误信息', value: alert.error }] : [])
        ],
        timestamp: normalizedTimestamp.toISOString()
      }]
    } as DiscordPayload;
  }

  // DingTalk/Feishu 格式
  const markdownContent = `${statusEmoji} **${baseInfo.api}**\n\n` +
    `> **类型**: ${baseInfo.type}\n` +
    `> **严重程度**: ${baseInfo.severity}\n` +
    `> **消息**: ${baseInfo.message}\n` +
    `> **时间**: ${baseInfo.time}\n` +
    (alert.latency ? `> **延迟**: ${alert.latency}ms\n` : '') +
    (alert.error ? `> **错误**: ${alert.error}\n` : '');

  if (platform === 'dingtalk' || platform === 'feishu') {
    return {
      msgtype: 'markdown',
      markdown: {
        title: `${severityEmoji} ${baseInfo.type} - ${baseInfo.api}`,
        text: markdownContent
      }
    } as DingTalkPayload;
  }

  // 通用格式
  const textContent = [
    `${severityEmoji} ${baseInfo.type} - ${baseInfo.api}`,
    `消息: ${baseInfo.message}`,
    `严重程度: ${baseInfo.severity}`,
    `时间: ${baseInfo.time}`,
    alert.latency ? `延迟: ${alert.latency}ms` : '',
    alert.error ? `错误: ${alert.error}` : ''
  ].filter(Boolean).join('\n');

  return {
    msg_type: 'text',
    content: { text: textContent }
  } as WebhookPayload;
}

/** Send a single webhook POST with timeout + abort handling and SSRF guard. */
export async function sendWebhookRequest(
  config: WebhookConfig,
  payload: WebhookPayload | DingTalkPayload | DiscordPayload
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
    const truncatedBody =
      body.length > MAX_WEBHOOK_TEXT_LENGTH
        ? body.slice(0, MAX_WEBHOOK_TEXT_LENGTH)
        : body;

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
