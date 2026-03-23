// app/lib/alerts.ts v4.0.1
import nodemailer from 'nodemailer';
import axios from 'axios';

export async function sendAlert(apiName: string, availability: number, time: string, suggestion: string) {
  const message = `
⚠️ API Monitor Alert ⚠️
API: ${apiName}
Current Availability: ${availability.toFixed(2)}%
Time: ${time}
Suggestion: ${suggestion}
  `.trim();

  console.log('[Alert]', message);

  // Send Email
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.ALERT_EMAIL) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"API Sentinel" <${process.env.SMTP_USER}>`,
        to: process.env.ALERT_EMAIL,
        subject: `[ALERT] ${apiName} Availability Dropped`,
        text: message,
      });
      console.log('[Alert] Email sent successfully.');
    } catch (error) {
      console.error('[Alert] Failed to send email:', error);
    }
  }

  // Send WeChat Work
  if (process.env.WECHAT_WEBHOOK_URL) {
    try {
      await axios.post(process.env.WECHAT_WEBHOOK_URL, {
        msgtype: 'text',
        text: {
          content: message,
        },
      });
      console.log('[Alert] WeChat message sent successfully.');
    } catch (error) {
      console.error('[Alert] Failed to send WeChat message:', error);
    }
  }
}
