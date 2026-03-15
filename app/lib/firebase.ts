// app/lib/firebase.ts v3.3.7
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

// 检查配置并脱敏打印关键信息以便核对
const checkConfig = () => {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([key, value]) => !value && key !== 'firestoreDatabaseId')
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.error(`Firebase Configuration Error: Missing keys: ${missingKeys.join(', ')}`);
  } else {
    console.log("Firebase Config detected:");
    console.log(`- Project ID: ${firebaseConfig.projectId}`);
    console.log(`- API Key: ${firebaseConfig.apiKey?.substring(0, 5)}...${firebaseConfig.apiKey?.substring(firebaseConfig.apiKey.length - 3)}`);
    console.log(`- Database ID: ${firebaseConfig.firestoreDatabaseId || '(default)'}`);
  }
};

if (typeof window !== 'undefined') {
  checkConfig();
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// 设置日志级别
setLogLevel('error');

// 初始化 Firestore，使用更稳健的配置
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: true, // 允许自动检测，但在受限环境下优先使用长轮询
}, firebaseConfig.firestoreDatabaseId || '(default)');

export const googleProvider = new GoogleAuthProvider();

async function testConnection(retries = 3) {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection verified successfully.");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('the client is offline')) {
      if (retries > 0) {
        console.warn(`Firestore is offline, retrying... (${retries} left)`);
        setTimeout(() => testConnection(retries - 1), 2000);
      } else {
        console.error("Firestore Error: Persistent offline state. Please verify your Project ID and API Key in AI Studio Secrets.");
        console.error("Also ensure that 'Cloud Firestore API' is enabled in your Google Cloud Console.");
      }
    } else if (errorMessage.includes('NOT_FOUND') || errorMessage.includes('not-found')) {
      console.error("Firestore Error: 404 NOT_FOUND. Check Project ID and Database ID.");
      console.error(`Current Config - Project: ${firebaseConfig.projectId}, Database: ${firebaseConfig.firestoreDatabaseId || '(default)'}`);
    } else {
      console.error("Firestore connection test failed:", errorMessage);
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}

