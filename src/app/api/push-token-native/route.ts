import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/push-token-native
 * Endpoint cho native iOS AppDelegate gọi TRỰC TIẾP (không cần auth)
 * Lưu APNs device token cho TẤT CẢ admin users
 */
export async function POST(request: NextRequest) {
  try {
    const { token, bundleId, platform } = await request.json();

    // Validate
    if (!token || !bundleId || !platform) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Verify bundle ID
    if (bundleId !== 'com.yurispa.beauty') {
      return NextResponse.json({ error: 'Invalid bundle' }, { status: 403 });
    }

    // Validate token format (APNs tokens are 64 hex characters)
    if (!/^[0-9a-f]{64}$/i.test(token)) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    // Get all admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true },
    });

    if (adminUsers.length === 0) {
      return NextResponse.json({ error: 'No admin users found' }, { status: 404 });
    }

    // Save token for all admin users
    for (const admin of adminUsers) {
      await prisma.pushToken.upsert({
        where: { token },
        update: { userId: admin.id, platform },
        create: { userId: admin.id, token, platform },
      });
    }

    console.log(`Native push token saved for ${adminUsers.length} admin(s): ${token.substring(0, 15)}...`);

    return NextResponse.json({ 
      success: true, 
      admins: adminUsers.length,
      tokenPrefix: token.substring(0, 15),
    });
  } catch (error: any) {
    console.error('Native push token save failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
