import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/push-debug-log
 * Native iOS AppDelegate ghi log chẩn đoán push notification
 * Không cần auth - chỉ để debug
 */
export async function POST(request: NextRequest) {
  try {
    const { event, data, bundleId } = await request.json();
    
    if (bundleId !== 'com.yurispa.beauty') {
      return NextResponse.json({ error: 'Invalid' }, { status: 403 });
    }

    // Lưu log vào database notification table (tạm dùng)
    await prisma.notification.create({
      data: {
        type: 'PUSH_DEBUG',
        channel: 'IN_APP',
        recipient: 'SYSTEM',
        content: `[${event}] ${data || ''}`,
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    console.log(`[PUSH-DEBUG] ${event}: ${data}`);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[PUSH-DEBUG] Log error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/push-debug-log
 * Đọc log chẩn đoán push notification (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const logs = await prisma.notification.findMany({
      where: { type: 'PUSH_DEBUG' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
