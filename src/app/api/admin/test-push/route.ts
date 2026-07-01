import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { sendPushToAdmins } from '@/lib/apns';

/**
 * POST /api/admin/test-push
 * Gửi push notification thử nghiệm đến tất cả admin devices.
 * Chỉ admin mới được gọi API này.
 */
export async function POST(request: NextRequest) {
  const jwtToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!jwtToken?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Kiểm tra role admin
  if (jwtToken.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await sendPushToAdmins(
      '🔔 Test Thông Báo',
      'Nếu bạn thấy tin nhắn này, Push Notification đã hoạt động thành công!',
      { test: 'true' }
    );

    return NextResponse.json({ sent: true, message: 'Test push sent successfully' });
  } catch (error: any) {
    console.error('Test push failed:', error);
    return NextResponse.json({ sent: false, error: error.message }, { status: 500 });
  }
}
