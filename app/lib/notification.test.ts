// app/lib/notification.test.ts v2.9.6
import { setNotificationConfig, sendAlert, testWebhook, notificationService } from './notification';
import { Alert } from '../types';

function makeAlert(): Alert {
  return {
    id: 'alert-1',
    apiId: 'openai-gpt-4o',
    apiName: 'GPT-4o',
    provider: 'OpenAI',
    type: 'downtime',
    severity: 'high',
    message: 'API 无响应',
    latency: 0,
    timestamp: new Date(),
    error: null,
    resolved: false,
  };
}

describe('notification module (single-instance service)', () => {
  afterEach(() => {
    // 每次测试后复位为关闭状态，避免影响其他用例
    setNotificationConfig({ enabled: false, webhooks: [] });
  });

  it('getConfig reflects updateConfig via setNotificationConfig', () => {
    setNotificationConfig({ enabled: true });
    expect(notificationService.getConfig().enabled).toBe(true);
  });

  it('does not send when disabled', async () => {
    setNotificationConfig({ enabled: false, webhooks: [] });
    const result = await sendAlert(makeAlert());
    expect(result).toEqual({ success: 0, failed: 0 });
  });

  it('reports failed for enabled webhooks with no network', async () => {
    setNotificationConfig({
      enabled: true,
      webhooks: [
        { enabled: true, url: 'https://hooks.slack.com/services/T/B/X' },
        { enabled: true, url: 'https://discord.com/api/webhooks/abc' },
      ],
    });
    const result = await sendAlert(makeAlert());
    expect(result.success).toBe(0);
    expect(result.failed).toBe(2);
  }, 15000);

  it('testWebhook returns boolean', async () => {
    setNotificationConfig({ enabled: true, webhooks: [{ enabled: true, url: 'https://discord.com/api/webhooks/abc' }] });
    const ok = await testWebhook({ enabled: true, url: 'https://discord.com/api/webhooks/abc' });
    expect(typeof ok).toBe('boolean');
  }, 15000);
});
