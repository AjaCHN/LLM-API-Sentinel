// app/lib/firebase.ts v4.0.2
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// 严格检查配置
const validateConfig = () => {
  const required = ['apiKey', 'projectId', 'appId'];
  const missing = required.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  if (missing.length > 0) {
    throw new Error(`Firebase Configuration Error: Missing required keys: ${missing.join(', ')}. Please check AI Studio Secrets.`);
  }
};

try {
  validateConfig();
} catch (e) {
  console.error(e);
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// 设置日志级别
setLogLevel('error');

// 初始化 Firestore
export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();

async function testConnection(retries = 5) {
  try {
    // 强制从服务器获取，验证连接
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection verified successfully.");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('the client is offline') || errorMessage.includes('failed-precondition')) {
      if (retries > 0) {
        console.warn(`Firestore is offline or connection pending, retrying... (${retries} left)`);
        setTimeout(() => testConnection(retries - 1), 3000);
      } else {
        console.error("Firestore Error: Persistent offline state. Please verify your Project ID and API Key in AI Studio Secrets.");
        console.error("Also ensure that 'Cloud Firestore API' is enabled in your Google Cloud Console.");
        console.error("Current Config Check:", {
          projectId: firebaseConfig.projectId ? 'Set' : 'MISSING',
          apiKey: firebaseConfig.apiKey ? 'Set' : 'MISSING',
          databaseId: firebaseConfig.firestoreDatabaseId
        });
      }
    } else if (errorMessage.includes('NOT_FOUND') || errorMessage.includes('not-found')) {
      console.error("Firestore Error: 404 NOT_FOUND. This usually means the Project ID or Database ID is incorrect.");
      console.error(`Current Config - Project: ${firebaseConfig.projectId}, Database: ${firebaseConfig.firestoreDatabaseId}`);
    } else {
      console.error("Firestore connection test failed with unexpected error:", errorMessage);
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}

