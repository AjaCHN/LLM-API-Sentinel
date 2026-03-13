// server.ts v2.1.0
import express from 'express';
import next from 'next';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { parse } from 'url';
import { performCheck, LATENCY_THRESHOLD, APIS_TO_CHECK, ApiConfig } from './app/lib/monitor';
import { sendAlert } from './app/lib/alerts';

const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  firestoreDatabaseId: process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID,
};
console.log('Firebase Config:', firebaseConfig);

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = 3000;

// Initialize Firebase Admin
const appAdmin = initializeApp({
  projectId: firebaseConfig.projectId,
});

const db = getFirestore(appAdmin, firebaseConfig.firestoreDatabaseId || '(default)');

// Keep track of recent checks to calculate availability
const recentChecks: Record<string, boolean[]> = {};

async function checkApi(api: ApiConfig) {
  console.log(`[Monitor] Checking ${api.name}...`);
  try {
    const result = await performCheck(api);
    const batch = db.batch();

    const statusRef = db.collection('api_status').doc(result.id);
    batch.set(statusRef, result);

    const historyRef = db.collection('status_history').doc();
    batch.set(historyRef, {
      apiId: result.id,
      status: result.status,
      latency: result.latency,
      throughput: result.throughput,
      timestamp: FieldValue.serverTimestamp(),
    });

    // Update availability history
    if (!recentChecks[result.id]) {
      recentChecks[result.id] = [];
    }
    recentChecks[result.id].push(result.status === 'online');
    if (recentChecks[result.id].length > 20) { // Keep last 20 checks
      recentChecks[result.id].shift();
    }

    const availability = (recentChecks[result.id].filter(Boolean).length / recentChecks[result.id].length) * 100;

    // Alert Logic
    if (availability < 95 && recentChecks[result.id].length >= 5) {
      const alertRef = db.collection('alerts').doc();
      batch.set(alertRef, {
        apiId: result.id,
        apiName: result.name,
        type: 'availability',
        message: `${result.name} availability dropped to ${availability.toFixed(2)}%. (Auto-detected)`,
        timestamp: FieldValue.serverTimestamp(),
        resolved: false
      });
      
      const suggestion = "Check API provider's status page. Verify network connectivity. Review recent API changes or rate limits.";
      await sendAlert(result.name, availability, new Date().toISOString(), suggestion);
      
      // Reset history to avoid spamming alerts
      recentChecks[result.id] = [];
    } else if (result.status === 'offline') {
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

    await batch.commit();
    console.log(`[Monitor] Check completed for ${api.name}.`);
  } catch (error) {
    console.error(`[Monitor] Check failed for ${api.name}:`, error);
  }
}

app.prepare().then(() => {
  const server = express();

  // Schedule individual API checks
  APIS_TO_CHECK.forEach(api => {
    setInterval(() => checkApi(api), api.interval);
    // Initial check
    setTimeout(() => checkApi(api), Math.random() * 5000); // Stagger initial checks
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

