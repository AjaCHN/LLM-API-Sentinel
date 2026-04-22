// app/api/check/route.ts v2.4.3
import { NextResponse } from 'next/server';
import { performCheck } from '../../lib/monitor';

export async function GET() {
  const results = await performCheck();
  return NextResponse.json(results);
}
