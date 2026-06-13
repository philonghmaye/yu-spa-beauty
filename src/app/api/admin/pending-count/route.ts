import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/pending-count
 * Trả về số lịch hẹn đang chờ xác nhận (PENDING)
 */
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ count: 0 });
  }

  try {
    const count = await prisma.appointment.count({
      where: { status: 'PENDING' },
    });

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
