// app/api/check/route.ts v2.2.0
import { NextRequest, NextResponse } from 'next/server';
import { performCheck } from '../../lib/monitor';

export async function GET(request: NextRequest) {
  const forceRefresh = request.nextUrl.searchParams.get('force') === 'true';
  const results = await performCheck(forceRefresh);
  return NextResponse.json(results);
}
