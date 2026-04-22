// middleware.ts v2.4.0
export default function middleware(request: Request) {
  // 简单的中间件，不做任何国际化处理
  return;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|favicon.ico).*)'
  ]
};
