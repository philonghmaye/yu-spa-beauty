import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/push-token
 * Lưu APNs device token để gửi push notification
 */
export async function POST(request: NextRequest) {
  const jwtToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!jwtToken?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { token, platform } = await request.json();

    if (!token || !platform) {
      return NextResponse.json({ error: 'Missing token or platform' }, { status: 400 });
    }

    // Upsert: nếu token đã tồn tại thì cập nhật userId (device chuyển account)
    await prisma.pushToken.upsert({
      where: { token },
      update: { userId: jwtToken.sub, platform },
      create: { userId: jwtToken.sub, token, platform },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save push token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/push-token
 * Xóa token khi user logout
 */
export async function DELETE(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (token) {
      await prisma.pushToken.deleteMany({ where: { token } });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
