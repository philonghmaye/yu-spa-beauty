import { NextResponse } from 'next/server';
import { sendPushToAdmins } from '@/lib/apns';

/**
 * POST /api/push-diag/test-booking
 * Giả lập push từ booking flow — gọi sendPushToAdmins trực tiếp
 */
export async function POST() {
  try {
    console.log('[test-booking] Starting sendPushToAdmins...');
    await sendPushToAdmins(
      '📅 Lịch hẹn mới (TEST)!',
      'Khách hàng Test đặt Massage lúc 10:00 ngày 2026-07-11',
      { appointmentId: 'test-123' }
    );
    console.log('[test-booking] sendPushToAdmins completed');
    return NextResponse.json({ sent: true });
  } catch (error: any) {
    console.error('[test-booking] sendPushToAdmins FAILED:', error);
    return NextResponse.json({ sent: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
