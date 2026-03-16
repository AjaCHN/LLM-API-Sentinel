// app/api/check/route.ts v2.3.0
import { NextResponse } from 'next/server';
import { performCheck, APIS_TO_CHECK } from '../../lib/monitor';
import { saveMetric } from '../../lib/metrics';

export async function GET() {
  const results = await Promise.all(APIS_TO_CHECK.map(async (api) => {
    const result = await performCheck(api);
    await saveMetric({
      apiId: api.id,
      latency: result.latency,
      throughput: result.throughput,
    });
    return result;
  }));
  return NextResponse.json(results);
}
