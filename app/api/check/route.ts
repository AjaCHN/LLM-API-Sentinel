// app/api/check/route.ts v2.3.0
import { NextResponse } from 'next/server';
import { performCheck, APIS_TO_CHECK } from '../../lib/monitor';

export async function GET() {
  const results = await Promise.all(APIS_TO_CHECK.map(api => performCheck(api)));
  return NextResponse.json(results);
}
