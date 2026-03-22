// server.ts v2.2.0
import express from 'express';
import next from 'next';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { parse } from 'url';
import path from 'path';
import nodemailer from 'nodemailer';
import { performCheck, LATENCY_THRESHOLD, APIS_TO_CHECK, ApiConfig, REGIONS } from './app/lib/monitor';
import { sendAlert } from './app/lib/alerts';
import firebaseConfig from './firebase-applet-config.json';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = 3000;

// Initialize Firebase Admin
// Note: In this environment, we use the project ID from config.
// The service account is handled by the platform.
const appAdmin = initializeApp({
  projectId: firebaseConfig.projectId,
});

const db = getFirestore(appAdmin, firebaseConfig.firestoreDatabaseId);

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
  for (const region of REGIONS) {
    try {
      const result = await performCheck(api, region.id);
      const batch = db.batch();

      // Get previous status
      const statusRef = db.collection('api_status').doc(result.id);
      const statusDoc = await statusRef.get();
      const prevStatus = statusDoc.exists ? statusDoc.data()?.status : null;

      batch.set(statusRef, { ...result, lastStatus: prevStatus });

      const historyRef = db.collection('status_history').doc();
      batch.set(historyRef, {
        apiId: result.id,
        region: region.id,
        status: result.status,
        latency: result.latency,
        throughput: result.throughput,
        timestamp: FieldValue.serverTimestamp(),
      });

      const metricRef = db.collection('api_metrics').doc();
      batch.set(metricRef, {
        apiId: result.id,
        latency: result.latency,
        throughput: result.throughput || 0,
        timestamp: FieldValue.serverTimestamp(),
      });

      // Alert Logic: Status Change
      if (prevStatus && prevStatus !== result.status) {
        const message = `${api.name} (${region.name}) status changed from ${prevStatus} to ${result.status}.`;
        
        // In-App Alert
        const alertRef = db.collection('alerts').doc();
        batch.set(alertRef, {
          apiId: result.id,
          apiName: result.name,
          region: region.id,
          type: 'downtime',
          message,
          timestamp: FieldValue.serverTimestamp(),
          resolved: false
        });

        // Email Alert (Fetch users who want alerts)
        const prefs = await db.collection('user_preferences').get();
        prefs.forEach(async (doc) => {
          const pref = doc.data();
          if (pref.enableEmailAlerts) {
            await sendEmailAlert(pref.email, 'API Status Alert', message);
          }
        });
      }

      if (!recentChecks[result.id]) {
        recentChecks[result.id] = [];
      }
      recentChecks[result.id].push(result.status === 'online');
      if (recentChecks[result.id].length > 20) {
        recentChecks[result.id].shift();
      }

      const availability = (recentChecks[result.id].filter(Boolean).length / recentChecks[result.id].length) * 100;

      if (availability < 90 && recentChecks[result.id].length >= 10) {
        const alertRef = db.collection('alerts').doc();
        batch.set(alertRef, {
          apiId: result.id,
          apiName: result.name,
          region: region.id,
          type: 'degradation',
          message: `${result.name} (${region.name}) availability dropped to ${availability.toFixed(2)}%. (Auto-detected)`,
          timestamp: FieldValue.serverTimestamp(),
          resolved: false
        });
        
        const suggestion = "Check API provider's status page. Verify network connectivity. Review recent API changes or rate limits.";
        await sendAlert(result.name, availability, new Date().toISOString(), suggestion);
        
        recentChecks[result.id] = [];
      } else if (result.status === 'offline') {
        const alertRef = db.collection('alerts').doc();
        batch.set(alertRef, {
          apiId: result.id,
          apiName: result.name,
          region: region.id,
          type: 'outage',
          message: `${result.name} (${region.name}) is currently offline. (Auto-detected)`,
          timestamp: FieldValue.serverTimestamp(),
          resolved: false
        });
      } else if (result.latency > LATENCY_THRESHOLD) {
        const alertRef = db.collection('alerts').doc();
        batch.set(alertRef, {
          apiId: result.id,
          apiName: result.name,
          region: region.id,
          type: 'latency',
          message: `${result.name} (${region.name}) latency is high: ${result.latency}ms. (Auto-detected)`,
          timestamp: FieldValue.serverTimestamp(),
          resolved: false
        });
      }

      await batch.commit();
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

