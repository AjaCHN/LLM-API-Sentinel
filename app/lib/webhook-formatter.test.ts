// app/lib/webhook-formatter.test.ts v2.9.6
import { formatAlert } from './webhook-formatter';

import { Alert } from '../types';

function baseAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: 'alert-1',
    apiId: 'openai-gpt-4o',
    apiName: 'GPT-4o',
    provider: 'OpenAI',
    type: 'downtime',
    severity: 'high',
    message: 'API 无响应',
    latency: 0,
    timestamp: new Date('2026-08-15T12:00:00Z'),
    error: null,
    ...overrides,
  };
}

describe('formatAlert', () => {
  it('formats generic platform as text payload', () => {
    const body = formatAlert(baseAlert(), 'generic') as { msg_type: string; content: { text: string } };
    expect(body.msg_type).toBe('text');
    expect(body.content.text).toContain('GPT-4o');
    expect(body.content.text).toContain('服务下线');
    expect(body.content.text).toContain('API 无响应');
  });

  it('formats dingtalk as markdown payload', () => {
    const body = formatAlert(baseAlert(), 'dingtalk') as {
      msgtype: string;
      markdown: { title: string; text: string };
    };
    expect(body.msgtype).toBe('markdown');
    expect(body.markdown.title).toContain('GPT-4o');
    expect(body.markdown.text).toContain('**严重程度**: HIGH');
  });

  it('formats feishu as markdown payload', () => {
    const body = formatAlert(baseAlert(), 'feishu') as {
      msgtype: string;
      markdown: { title: string; text: string };
    };
    expect(body.msgtype).toBe('markdown');
    expect(body.markdown.text).toContain('GPT-4o');
  });

  it('formats discord as embed payload with color', () => {
    const body = formatAlert(baseAlert({ severity: 'critical' }), 'discord') as {
      embeds: Array<{ title: string; color: number; fields: Array<{ name: string; value: string }> }>;
    };
    expect(body.embeds).toHaveLength(1);
    expect(body.embeds[0].color).toBe(16724788); // critical red
    expect(body.embeds[0].title).toContain('GPT-4o');
  });

  it('includes latency field when present', () => {
    const body = formatAlert(
      baseAlert({ type: 'latency', latency: 1500, error: 'slow' }),
      'discord'
    ) as { embeds: Array<{ fields: Array<{ name: string; value: string }> }> };
    const latencyField = body.embeds[0].fields.find((f) => f.name === '延迟');
    expect(latencyField?.value).toBe('1500ms');
    const errorField = body.embeds[0].fields.find((f) => f.name === '错误信息');
    expect(errorField?.value).toBe('slow');
  });

  it('omits latency field when latency is zero', () => {
    const body = formatAlert(baseAlert({ latency: 0 }), 'discord') as {
      embeds: Array<{ fields: Array<{ name: string; value: string }> }>;
    };
    const latencyField = body.embeds[0].fields.find((f) => f.name === '延迟');
    expect(latencyField).toBeUndefined();
  });

  it('maps severity to emoji for high', () => {
    const body = formatAlert(baseAlert({ severity: 'high' }), 'generic') as {
      content: { text: string };
    };
    expect(body.content.text).toContain('🟠');
  });

  it('formats slack payload with attachment color', () => {
    const body = formatAlert(baseAlert({ severity: 'critical' }), 'slack') as {
      text: string;
      attachments: Array<{ color: string; title: string }>;
    };
    expect(body.text).toContain('GPT-4o');
    expect(body.attachments[0].color).toBe('#e74c3c');
  });

  it('formats teams MessageCard with themeColor', () => {
    const body = formatAlert(baseAlert({ severity: 'high' }), 'teams') as {
      '@type': string;
      themeColor: string;
      summary: string;
      sections: Array<{ activityTitle: string; facts: Array<{ name: string; value: string }> }>;
    };
    expect(body['@type']).toBe('MessageCard');
    expect(body.themeColor).toBe('e67e22');
    expect(body.sections[0].activityTitle).toContain('GPT-4o');
    const severityFact = body.sections[0].facts.find((f) => f.name === '严重程度');
    expect(severityFact?.value).toBe('HIGH');
  });
});
