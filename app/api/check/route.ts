// app/api/check/route.ts v2.6.0
import { NextResponse } from 'next/server';
import { performCheck, APIS_TO_CHECK, REGIONS } from '../../lib/monitor';
import { saveMetric, checkAndCreateAlerts } from '../../lib/metrics';
import { saveApiStatus, saveApiHistory } from '../../lib/firestoreUtils';

export async function GET() {
  const allResults = [];
  
  for (const region of REGIONS) {
    const results = await Promise.all(APIS_TO_CHECK.map(async (api) => {
      const result = await performCheck(api, region.id);
      await saveApiStatus(result);
      await saveApiHistory(result);
      await saveMetric({
        apiId: result.id, // Save metric with region-specific ID
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
