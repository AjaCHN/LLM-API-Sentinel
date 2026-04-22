// server.ts v2.1.0
import express from 'express';
import next from 'next';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { parse } from 'url';
import { performCheck, LATENCY_THRESHOLD } from './app/lib/monitor';
import fs from 'fs';

// Read firebase config from environment variables or config file
const firebaseConfig = process.env.FIREBASE_CONFIG ? 
  JSON.parse(process.env.FIREBASE_CONFIG) : 
  JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

// Don't log sensitive config in production
if (process.env.NODE_ENV !== 'production') {
  console.log('Firebase Config initialized');
}

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = 3002;

// Initialize Firebase Admin
const appAdmin = initializeApp({
  projectId: firebaseConfig.projectId,
});

const db = getFirestore(appAdmin, firebaseConfig.firestoreDatabaseId);

async function runBackgroundMonitor() {
  console.log('[Monitor] Starting background check...');
  try {
    const results = await performCheck();
    const batch = db.batch();

    for (const result of results) {
      const statusRef = db.collection('api_status').doc(result.id);
      batch.set(statusRef, result);

      const historyRef = db.collection('status_history').doc();
      batch.set(historyRef, {
        apiId: result.id,
        status: result.status,
        latency: result.latency,
        timestamp: FieldValue.serverTimestamp(),
      });

      // Alert Logic
      if (result.status === 'offline') {
        const alertRef = db.collection('alerts').doc();
        batch.set(alertRef, {
          apiId: result.id,
          apiName: result.name,
          type: 'downtime',
          message: `${result.name} is currently offline. (Auto-detected)`,
          timestamp: FieldValue.serverTimestamp(),
          resolved: false
        });
      } else if (result.latency > LATENCY_THRESHOLD) {
        const alertRef = db.collection('alerts').doc();
        batch.set(alertRef, {
          apiId: result.id,
          apiName: result.name,
          type: 'latency',
          message: `${result.name} latency is high: ${result.latency}ms. (Auto-detected)`,
          timestamp: FieldValue.serverTimestamp(),
          resolved: false
        });
      }
    }

    await batch.commit();
    console.log('[Monitor] Background check completed and synced.');
  } catch (error) {
    console.error('[Monitor] Background check failed:', error);
  }
}

app.prepare().then(() => {
  const server = express();

  // Background task: Every 5 minutes
  setInterval(runBackgroundMonitor, 5 * 60 * 1000);
  // Initial check
  setTimeout(runBackgroundMonitor, 10000);

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
