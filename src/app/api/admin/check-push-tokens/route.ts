import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/check-push-tokens
 * Kiểm tra số push tokens hiện có trên server
 */
export async function GET(request: NextRequest) {
  const jwtToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!jwtToken?.sub || jwtToken.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tokens = await prisma.pushToken.count({
      where: {
        user: { role: 'ADMIN', isActive: true }
      }
    });

    const tokenList = await prisma.pushToken.findMany({
      where: {
        user: { role: 'ADMIN', isActive: true }
      },
      select: {
        token: true,
        platform: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ 
      tokens, 
      details: tokenList.map(t => ({
        prefix: t.token.substring(0, 15) + '...',
        platform: t.platform,
        created: t.createdAt,
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
