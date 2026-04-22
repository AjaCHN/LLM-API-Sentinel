// middleware.ts v2.4.3
import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};