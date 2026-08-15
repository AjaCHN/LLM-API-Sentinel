// app/lib/webhook-formatter.ts v2.9.6
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

// Slack 消息格式
export interface SlackPayload {
  text: string;
  attachments?: Array<{ color: string; title: string; text: string; fields?: Array<{ title: string; value: string; short?: boolean }> }>;
}

// Microsoft Teams (Office 365 Connector) MessageCard 格式
export interface TeamsPayload {
  '@type': 'MessageCard';
  '@context': 'http://schema.org/extensions';
  themeColor: string;
  summary: string;
  sections: Array<{ activityTitle: string; facts: Array<{ name: string; value: string }> }>;
}

export type WebhookBody = WebhookPayload | DingTalkPayload | DiscordPayload | SlackPayload | TeamsPayload;

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

  if (platform === 'slack') {
    const hexColor: Record<string, string> = {
      low: '#3498db',
      medium: '#f1c40f',
      high: '#e67e22',
      critical: '#e74c3c'
    };
    return {
      text: `${severityEmoji} ${baseInfo.type} - ${baseInfo.api}`,
      attachments: [{
        color: hexColor[alert.severity] || '#95a5a6',
        title: `${baseInfo.api} 告警`,
        text: baseInfo.message,
        fields: [
          { title: '严重程度', value: baseInfo.severity, short: true },
          { title: '类型', value: baseInfo.type, short: true },
          ...(alert.latency ? [{ title: '延迟', value: `${alert.latency}ms`, short: true }] : []),
          ...(alert.error ? [{ title: '错误信息', value: alert.error }] : [])
        ]
      }]
    } as SlackPayload;
  }

  if (platform === 'teams') {
    const themeColor: Record<string, string> = {
      low: '3498db',
      medium: 'f1c40f',
      high: 'e67e22',
      critical: 'e74c3c'
    };
    return {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: themeColor[alert.severity] || '95a5a6',
      summary: `${baseInfo.type} - ${baseInfo.api}`,
      sections: [{
        activityTitle: `${severityEmoji} ${baseInfo.type} - ${baseInfo.api}`,
        facts: [
          { name: '严重程度', value: baseInfo.severity },
          { name: '类型', value: baseInfo.type },
          { name: '消息', value: baseInfo.message },
          { name: '时间', value: baseInfo.time },
          ...(alert.latency ? [{ name: '延迟', value: `${alert.latency}ms` }] : []),
          ...(alert.error ? [{ name: '错误', value: alert.error }] : [])
        ]
      }]
    } as TeamsPayload;
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
