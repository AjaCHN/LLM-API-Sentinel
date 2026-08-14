// app/lib/webhook-formatter.ts v2.9.0
import { Alert } from '../types';

// Webhook 消息格式
export interface WebhookPayload {
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
export interface DingTalkPayload {
  msgtype: 'text' | 'markdown';
  text?: { content: string };
  markdown?: { title: string; text: string };
}

// Discord 消息格式
export interface DiscordPayload {
  embeds: Array<{
    title: string;
    description: string;
    color: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    timestamp?: string;
  }>;
}

export type WebhookBody = WebhookPayload | DingTalkPayload | DiscordPayload;

/** 规范化告警时间戳为 Date 对象 */
function normalizeTimestamp(alert: Alert): Date {
  const { timestamp } = alert;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'number') return new Date(timestamp);
  if (typeof timestamp === 'string') return new Date(timestamp);
  return new Date();
}

/** 将告警格式化为目标平台所需的 webhook 正文 */
export function formatAlert(alert: Alert, platform: string): WebhookBody {
  const normalizedTimestamp = normalizeTimestamp(alert);
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
