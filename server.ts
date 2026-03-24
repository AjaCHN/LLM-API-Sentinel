// server.ts v4.0.5
import express from 'express';
import next from 'next';
import { adminDb } from './app/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { parse } from 'url';
import nodemailer from 'nodemailer';
import { performCheck, LATENCY_THRESHOLD, APIS_TO_CHECK, ApiConfig, REGIONS } from './app/lib/monitor';
import { sendAlert } from './app/lib/alerts';
import { saveApiStatus, saveApiHistory } from './app/lib/firestore-server';
import { saveMetric, checkAndCreateAlerts } from './app/lib/metrics-server';
import { getApiConfigAdmin } from './app/lib/config-server';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = 3000;

// Nodemailer Transporter (Requires SMTP config)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmailAlert(to: string, subject: string, text: string) {
  if (!process.env.SMTP_HOST) return;
  await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, text });
}

// Keep track of recent checks to calculate availability
const recentChecks: Record<string, boolean[]> = {};

async function checkApi(api: ApiConfig) {
  const configOverride = await getApiConfigAdmin(api.id);
  for (const region of REGIONS) {
    try {
      const result = await performCheck(api, region.id, configOverride);
      
      // Use server-side utilities
      await saveApiStatus(result);
      await saveApiHistory(result);
      await saveMetric({
        apiId: result.id,
        latency: result.latency,
        throughput: result.throughput,
      });
      await checkAndCreateAlerts(result);
      
      // Availability logic for local tracking (optional, but kept for consistency)
      if (!recentChecks[result.id]) {
        recentChecks[result.id] = [];
      }
      recentChecks[result.id].push(result.status === 'online');
      if (recentChecks[result.id].length > 20) {
        recentChecks[result.id].shift();
      }

    } catch (error) {
      console.error(`[Monitor] Check failed for ${api.name} in ${region.name}:`, error);
    }
  }
}



app.prepare().then(() => {
  const server = express();

  // Schedule individual API checks
  APIS_TO_CHECK.forEach(api => {
    setInterval(() => checkApi(api), api.interval);
    setTimeout(() => checkApi(api), Math.random() * 5000);
  });

  server.all(/.*/, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Next.js prepare failed:', err);
  process.exit(1);
});

