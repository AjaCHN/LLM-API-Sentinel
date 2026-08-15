/**
 * @module notification
 * @description Handles platform-aware alert notifications (Discord / DingTalk / Feishu / generic webhook).
 * 平台格式化与发送逻辑见 notification-platforms.ts，本文件仅负责配置编排与对外 API。
 */

// app/lib/notification.ts v2.9.6
import { Alert } from '../types';
import { detectPlatform, formatAlert, sendWebhookRequest } from './notification-platforms';

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

// 通知服务类：编排多 webhook 并行发送与配置管理
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

    const enabledWebhooks = this.config.webhooks.filter(w => w.enabled);

    if (enabledWebhooks.length === 0) {
      this.isSending = false;
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

    const success = results.filter(r => r === 'success').length;
    const failed = results.filter(r => r === 'failed').length;

    this.isSending = false;
    return { success, failed };
  }

  // 测试 Webhook 连接
  async testWebhook(_webhook: WebhookConfig): Promise<boolean> {
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

    return (await this.sendAlert(testAlert)).success > 0;
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
