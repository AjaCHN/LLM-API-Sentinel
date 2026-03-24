// app/lib/firebase-admin.ts v4.0.2
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

if (getApps().length === 0) {
  adminApp = initializeApp({
    projectId: firebaseConfig.projectId,
  });
} else {
  adminApp = getApps()[0];
}

adminDb = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
adminAuth = getAuth(adminApp);

export { adminApp, adminDb, adminAuth };
