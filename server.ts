// server.ts v2.6.0
import express from 'express';
import next from 'next';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { parse } from 'url';
import { performCheck } from './app/lib/monitor';
import { LATENCY_THRESHOLD } from './app/constants';
import type { ApiCheckResult } from './app/types';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || '3000', 10);

if (dev) {
  console.log('[Server] Running in development mode');
}

const appAdmin = initializeApp({
  projectId: firebaseConfig.projectId,
});

const db = getFirestore(appAdmin, firebaseConfig.firestoreDatabaseId);

async function hasExistingAlert(apiId: string, alertType: string): Promise<boolean> {
  try {
    const alertsSnapshot = await db
      .collection('alerts')
      .where('apiId', '==', apiId)
      .where('type', '==', alertType)
      .where('resolved', '==', false)
      .limit(1)
      .get();
    return !alertsSnapshot.empty;
  } catch (error) {
    console.error('[Server] Failed to check existing alerts:', error);
    return false;
  }
}

async function runBackgroundMonitor() {
  console.log('[Monitor] Starting background check...');
  try {
    const results = await performCheck() as ApiCheckResult[];
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

      if (result.status === 'offline') {
        const hasExisting = await hasExistingAlert(result.id, 'downtime');
        if (!hasExisting) {
          const alertRef = db.collection('alerts').doc();
          batch.set(alertRef, {
            apiId: result.id,
            apiName: result.name,
            type: 'downtime',
            message: `${result.name} is currently offline. (Auto-detected)`,
            timestamp: FieldValue.serverTimestamp(),
            resolved: false
          });
        }
      } else if (result.latency > LATENCY_THRESHOLD) {
        const hasExisting = await hasExistingAlert(result.id, 'latency');
        if (!hasExisting) {
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
