import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple path-based protection
  // NextAuth handles actual session validation via its own middleware
  const { pathname } = request.nextUrl;

  // Admin routes - will be checked in page components via auth()
  if (pathname.startsWith('/admin')) {
    // Let Next.js handle, individual pages check auth
    return NextResponse.next();
  }

  // Customer account routes
  if (pathname.startsWith('/tai-khoan')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/tai-khoan/:path*'],
};
