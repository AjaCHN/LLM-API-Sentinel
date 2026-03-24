// app/api/check/route.ts v4.0.3
import { NextResponse } from 'next/server';
import { performCheck, APIS_TO_CHECK, REGIONS } from '../../lib/monitor';
import { saveMetric, checkAndCreateAlerts } from '../../lib/metrics-server';
import { saveApiStatus, saveApiHistory } from '../../lib/firestore-server';

export async function GET() {
  const allResults = [];
  
  for (const region of REGIONS) {
    const results = await Promise.all(APIS_TO_CHECK.map(async (api) => {
      const result = await performCheck(api, region.id);
      // These functions now use firebase-admin on the server
      await saveApiStatus(result);
      await saveApiHistory(result);
      await saveMetric({
        apiId: result.id,
        latency: result.latency,
        throughput: result.throughput,
      });
      await checkAndCreateAlerts(result);
      return result;
    }));
    allResults.push(...results);
  }
  
  return NextResponse.json(allResults);
}

