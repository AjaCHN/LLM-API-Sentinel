import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

interface ApiCheckResult {
  id: string;
  name: string;
  provider: string;
  url: string;
  status: 'online' | 'offline' | 'degraded';
  latency: number;
  lastChecked: string;
  error?: string;
  retries?: number;
}

const APIS_TO_CHECK = [
  { id: 'openai-gpt-4o', name: 'GPT-4o', provider: 'OpenAI', url: 'https://api.openai.com/v1/models' },
  { id: 'anthropic-claude-3-5', name: 'Claude 3.5', provider: 'Anthropic', url: 'https://api.anthropic.com/v1/messages' },
  { id: 'google-gemini-1-5', name: 'Gemini 1.5', provider: 'Google', url: 'https://generativelanguage.googleapis.com/v1beta/models' },
  { id: 'meta-llama-3', name: 'Llama 3 (Groq)', provider: 'Meta', url: 'https://api.groq.com/openai/v1/models' },
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', url: 'https://api.mistral.ai/v1/models' },
  { id: 'moonshot-v1', name: 'Kimi (Moonshot)', provider: 'Moonshot', url: 'https://api.moonshot.cn/v1/models' },
  { id: 'zhipu-glm-4', name: 'GLM-4 (Zhipu)', provider: 'ZhipuAI', url: 'https://open.bigmodel.cn/api/paas/v4/model_list' },
  { id: 'baichuan-2', name: 'Baichuan 2', provider: 'Baichuan', url: 'https://api.baichuan-ai.com/v1/models' },
  { id: 'qwen-max', name: 'Qwen Max (Ali)', provider: 'Alibaba', url: 'https://dashscope.aliyuncs.com/api/v1/models' },
  { id: 'hunyuan-pro', name: 'Hunyuan (Tencent)', provider: 'Tencent', url: 'https://hunyuan.tencentcloudapi.com' },
  { id: 'ernie-4', name: 'Ernie 4.0 (Baidu)', provider: 'Baidu', url: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', url: 'https://api.deepseek.com/models' }
];

const LATENCY_THRESHOLD = 1500;
const MAX_RETRIES = 2;

async function checkApi(api: typeof APIS_TO_CHECK[0], retries: number = 0): Promise<ApiCheckResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(api.url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - start;
    const isOnline = response.status < 500;
    
    if (!isOnline && retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return checkApi(api, retries + 1);
    }
    
    return {
      ...api,
      status: isOnline ? 'online' : 'offline',
      latency,
      lastChecked: new Date().toISOString(),
      retries,
    };
  } catch (error) {
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return checkApi(api, retries + 1);
    }
    
    return {
      ...api,
      status: 'offline',
      latency: 0,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      retries,
    };
  }
}

async function performCheck(): Promise<ApiCheckResult[]> {
  const results = await Promise.all(
    APIS_TO_CHECK.map(api => checkApi(api))
  );
  return results;
}

async function saveResults(results: ApiCheckResult[]) {
  const batch = db.batch();
  const timestamp = admin.firestore.FieldValue.serverTimestamp();

  for (const result of results) {
    const statusRef = db.collection('api_status').doc(result.id);
    batch.set(statusRef, result);

    const historyRef = db.collection('status_history').doc();
    batch.set(historyRef, {
      apiId: result.id,
      status: result.status,
      latency: result.latency,
      timestamp,
    });

    if (result.status === 'offline') {
      const alertRef = db.collection('alerts').doc();
      batch.set(alertRef, {
        apiId: result.id,
        apiName: result.name,
        type: 'downtime',
        message: `${result.name} is currently offline. (Auto-detected)`,
        timestamp,
        resolved: false
      });
    } else if (result.latency > LATENCY_THRESHOLD) {
      const alertRef = db.collection('alerts').doc();
      batch.set(alertRef, {
        apiId: result.id,
        apiName: result.name,
        type: 'latency',
        message: `${result.name} latency is high: ${result.latency}ms. (Auto-detected)`,
        timestamp,
        resolved: false
      });
    }
  }

  await batch.commit();
}

export const scheduledMonitor = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    console.log('[Cloud Functions] Starting scheduled API check...');
    try {
      const results = await performCheck();
      await saveResults(results);
      console.log('[Cloud Functions] API check completed successfully');
      return null;
    } catch (error) {
      console.error('[Cloud Functions] API check failed:', error);
      return null;
    }
  });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getApiStatus = functions.https.onCall(async (_data, _context) => {
  const statusSnapshot = await db.collection('api_status').get();
  const results: ApiCheckResult[] = [];
  
  statusSnapshot.forEach(doc => {
    results.push(doc.data() as ApiCheckResult);
  });
  
  return results;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const manualCheck = functions.https.onCall(async (_data, _context) => {
  console.log('[Cloud Functions] Manual check triggered');
  try {
    const results = await performCheck();
    await saveResults(results);
    return { success: true, results };
  } catch (error) {
    console.error('[Cloud Functions] Manual check failed:', error);
    return { success: false, error: String(error) };
  }
});
