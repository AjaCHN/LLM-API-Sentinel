// app/lib/notification-platforms.test.ts v2.8.2
import { detectPlatform, isPrivateWebhookHost, formatAlert } from './notification-platforms';
import type { Alert } from '../types';

const baseAlert: Alert = {
  id: 'a1',
  apiId: 'openai',
  apiName: 'OpenAI',
  type: 'downtime',
  severity: 'high',
  message: 'service down',
  timestamp: new Date('2026-08-14T10:00:00Z'),
  resolved: false,
  latency: 0,
};

describe('detectPlatform', () => {
  it('detects dingtalk', () => {
    expect(detectPlatform('https://oapi.dingtalk.com/robot/send')).toBe('dingtalk');
  });
  it('detects feishu', () => {
    expect(detectPlatform('https://open.feishu.cn/open-apis/bot/v2/hook')).toBe('feishu');
  });
  it('detects discord', () => {
    expect(detectPlatform('https://discord.com/api/webhooks/abc')).toBe('discord');
  });
  it('falls back to generic', () => {
    expect(detectPlatform('https://example.com/hook')).toBe('generic');
  });
});

describe('isPrivateWebhookHost', () => {
  it('blocks localhost', () => {
    expect(isPrivateWebhookHost('https://localhost/webhook')).toBe(true);
  });
  it('blocks 127.0.0.1', () => {
    expect(isPrivateWebhookHost('https://127.0.0.1/webhook')).toBe(true);
  });
  it('blocks 10.x private range', () => {
    expect(isPrivateWebhookHost('https://10.0.0.5/webhook')).toBe(true);
  });
  it('blocks 192.168.x', () => {
    expect(isPrivateWebhookHost('https://192.168.1.1/webhook')).toBe(true);
  });
  it('blocks 172.16.x', () => {
    expect(isPrivateWebhookHost('https://172.16.0.1/webhook')).toBe(true);
  });
  it('blocks 169.254 link-local', () => {
    expect(isPrivateWebhookHost('https://169.254.169.254/webhook')).toBe(true);
  });
  it('allows public https host', () => {
    expect(isPrivateWebhookHost('https://hooks.slack.com/services/x/y')).toBe(false);
  });
  it('treats invalid url as unsafe', () => {
    expect(isPrivateWebhookHost('not-a-url')).toBe(true);
  });
});

describe('formatAlert', () => {
  it('formats discord embeds with severity color', () => {
    const payload = formatAlert(baseAlert, 'discord') as { embeds: Array<{ title: string; color: number }> };
    expect(payload.embeds).toHaveLength(1);
    expect(payload.embeds[0].title).toContain('OpenAI');
  });

  it('formats dingtalk markdown', () => {
    const payload = formatAlert(baseAlert, 'dingtalk') as { markdown: { title: string; text: string } };
    expect(payload.markdown.text).toContain('OpenAI');
  });

  it('formats generic text payload', () => {
    const payload = formatAlert(baseAlert, 'generic') as { content: { text: string } };
    expect(payload.content.text).toContain('service down');
  });

  it('accepts numeric timestamp alert', () => {
    const withNumTime: Alert = { ...baseAlert, timestamp: Date.now() };
    expect(() => formatAlert(withNumTime, 'feishu')).not.toThrow();
  });
});
