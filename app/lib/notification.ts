// app/lib/notification.ts v2.5.0
import { Alert } from '../types';

// 通知配置接口
interface NotificationConfig {
  email?: string;
  phone?: string;
  enabled: boolean;
  notificationTypes: ('email' | 'sms')[];
}

// 通知服务类
class NotificationService {
  private config: NotificationConfig;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  // 发送邮件通知
  async sendEmailAlert(alert: Alert): Promise<boolean> {
    if (!this.config.email || !this.config.notificationTypes.includes('email')) {
      return false;
    }

    try {
      // 实际应用中，这里应该调用邮件服务 API
      console.log(`Sending email alert to ${this.config.email}: ${alert.message}`);
      // 模拟邮件发送
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Failed to send email alert:', error);
      return false;
    }
  }

  // 发送短信通知
  async sendSmsAlert(alert: Alert): Promise<boolean> {
    if (!this.config.phone || !this.config.notificationTypes.includes('sms')) {
      return false;
    }

    try {
      // 实际应用中，这里应该调用短信服务 API
      console.log(`Sending SMS alert to ${this.config.phone}: ${alert.message}`);
      // 模拟短信发送
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Failed to send SMS alert:', error);
      return false;
    }
  }

  // 发送告警通知
  async sendAlert(alert: Alert): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    await Promise.all([
      this.sendEmailAlert(alert),
      this.sendSmsAlert(alert)
    ]);
  }
}

// 默认通知配置
const defaultConfig: NotificationConfig = {
  enabled: false,
  notificationTypes: []
};

// 导出通知服务实例
export const notificationService = new NotificationService(defaultConfig);

// 导出设置通知配置的函数
export function setNotificationConfig(config: NotificationConfig): void {
  notificationService['config'] = config;
}

// 导出发送告警的函数
export async function sendAlert(alert: Alert): Promise<void> {
  await notificationService.sendAlert(alert);
}
