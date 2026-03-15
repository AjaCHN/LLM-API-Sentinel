// app/lib/firebase.ts v3.3.6
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  firestoreDatabaseId: process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID,
};

// 检查配置是否完整
const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value && key !== 'firestoreDatabaseId')
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error(`Firebase Configuration Error: Missing required environment variables: ${missingKeys.join(', ')}`);
  console.error("Please check your AI Studio Secrets and ensure all NEXT_PUBLIC_FIREBASE_* variables are set.");
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// 设置日志级别为 error 以减少干扰
setLogLevel('error');

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
  useFetchStreams: false, // 禁用 fetch streams 以提高在某些代理环境下的稳定性
}, firebaseConfig.firestoreDatabaseId || '(default)');
export const googleProvider = new GoogleAuthProvider();





async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successful.");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('the client is offline')) {
      console.error("Firestore Error: The client is offline. Check your internet connection or Firebase config.");
    } else if (errorMessage.includes('NOT_FOUND') || errorMessage.includes('not-found')) {
      console.error("Firestore Error: 404 NOT_FOUND. This usually means the Project ID or Database ID is incorrect.");
      console.error(`Current Config - Project: ${firebaseConfig.projectId}, Database: ${firebaseConfig.firestoreDatabaseId || '(default)'}`);
      console.error("Please verify these values in your AI Studio Secrets.");
    } else {
      console.error("Firestore connection test failed:", errorMessage);
    }
  }
}
testConnection();

