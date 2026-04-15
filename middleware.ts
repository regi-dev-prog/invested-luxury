import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('x-middleware-override', '1');
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
