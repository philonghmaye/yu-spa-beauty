import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Customer account routes — require login
  if (pathname.startsWith('/tai-khoan')) {
    const token = await getToken({ req: request, secret });
    if (!token) {
      return NextResponse.redirect(new URL('/dang-nhap', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/tai-khoan/:path*'],
};
