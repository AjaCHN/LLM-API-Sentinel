/**
 * @module notification
 * @description Handles platform-aware alert notifications (Discord / DingTalk / Feishu / generic webhook).
 * Provides formatting, sending, batch-parallel dispatch, and helper utilities.
 */

// app/lib/notification.ts v2.6.3
import { Alert } from '../types';

/** Compute HMAC-SHA256 signature (hex) for the given timestamp+secret. */
async function signWithSecret(timestamp: number, secret: string): Promise<string> {
  const stringToSign = `${timestamp}\n${secret}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(stringToSign),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(stringToSign));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Webhook 配置接口
export interface WebhookConfig {
  enabled: boolean;
  url: string;
  secret?: string; // 可选的签名密钥
  timeout?: number; // 超时时间(ms)，默认 5000
}

// 通知配置接口
export interface NotificationConfig {
  webhooks: WebhookConfig[];
  enabled: boolean;
}

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

/** Detect platform type from webhook URL. */
function detectPlatform(url: string): 'dingtalk' | 'feishu' | 'discord' | 'generic' {
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
function formatAlert(alert: Alert, platform: string): WebhookPayload | DingTalkPayload | DiscordPayload {
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
      low: 3447003,     // 蓝色
      medium: 16776960, // 黄色
      high: 16744448,   // 橙色
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

/** Send a webhook POST with timeout + abort handling. */
async function sendWebhookRequest(
  config: WebhookConfig,
  payload: WebhookPayload | DingTalkPayload | DiscordPayload
): Promise<boolean> {
  const timeout = config.timeout || 5000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 可选的 HMAC 签名（DingTalk/Feishu/通用 Webhook）
    if (config.secret) {
      const platform = detectPlatform(config.url);
      const timestamp = Date.now();
      const signature = await signWithSecret(timestamp, config.secret);
      if (platform === 'dingtalk') {
        headers['timestamp'] = String(timestamp);
        headers['sign'] = signature;
      } else if (platform === 'feishu') {
        headers['X-Lark-Signature'] = signature;
      } else {
        headers['X-Signature'] = `sha256=${signature}`;
        headers['X-Timestamp'] = String(timestamp);
      }
    }

    const response = await fetch(config.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Webhook request failed with status ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Webhook request timed out after ${timeout}ms`);
    } else {
      console.error('Webhook request failed:', error);
    }
    return false;
  }
}

// 通知服务类
class NotificationService {
  private config: NotificationConfig;
  private isSending: boolean = false;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  // 更新配置
  updateConfig(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 获取当前配置
  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  // 发送告警到所有启用的 Webhook
  async sendAlert(alert: Alert): Promise<{ success: number; failed: number }> {
    if (!this.config.enabled || this.isSending) {
      return { success: 0, failed: 0 };
    }

    this.isSending = true;
    let success = 0;
    let failed = 0;

    try {
      const enabledWebhooks = this.config.webhooks.filter(w => w.enabled);

      if (enabledWebhooks.length === 0) {
        return { success: 0, failed: 0 };
      }

      // 并行发送到所有 Webhook
      const results = await Promise.all(
        enabledWebhooks.map(async (webhook) => {
          const platform = detectPlatform(webhook.url);
          const payload = formatAlert(alert, platform);
          const success = await sendWebhookRequest(webhook, payload);
          return success ? 'success' : 'failed';
        })
      );

      success = results.filter(r => r === 'success').length;
      failed = results.filter(r => r === 'failed').length;

      return { success, failed };
    } finally {
      this.isSending = false;
    }
  }

  // 测试指定 Webhook 连接
  async testWebhook(webhook: WebhookConfig): Promise<boolean> {
    const testAlert: Alert = {
      id: 'test',
      apiId: 'test-api',
      apiName: 'Test API',
      type: 'downtime',
      severity: 'medium',
      message: '这是一条测试消息 / This is a test message',
      timestamp: new Date(),
      resolved: false
    };

    // 仅向传入的 webhook 发送，避免误用全局配置
    const tester = new NotificationService({ enabled: true, webhooks: [webhook] });
    return (await tester.sendAlert(testAlert)).success > 0;
  }
}

// 默认通知配置
const defaultConfig: NotificationConfig = {
  enabled: false,
  webhooks: []
};

// 导出通知服务实例
export const notificationService = new NotificationService(defaultConfig);

// 导出设置通知配置的函数
export function setNotificationConfig(config: Partial<NotificationConfig>): void {
  notificationService.updateConfig(config);
}

// 导出发送告警的函数
export async function sendAlert(alert: Alert): Promise<{ success: number; failed: number }> {
  return notificationService.sendAlert(alert);
}

// 导出测试 Webhook 的函数
export async function testWebhook(webhook: WebhookConfig): Promise<boolean> {
  return notificationService.testWebhook(webhook);
}
