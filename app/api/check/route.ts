// app/api/check/route.ts v2.3.0
import { NextRequest, NextResponse } from 'next/server';
import { performCheck } from '../../lib/monitor';

export async function GET(request: NextRequest) {
  // 检查是否为本地请求或经过身份验证的请求
  const isLocal = request.ip === '127.0.0.1' || request.ip === '::1';
  const authHeader = request.headers.get('authorization');
  
  // 仅允许本地请求或带有有效授权的请求
  if (!isLocal && !authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const forceRefresh = request.nextUrl.searchParams.get('force') === 'true';
  const results = await performCheck(forceRefresh);
  return NextResponse.json(results);
}
