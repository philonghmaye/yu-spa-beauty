import { NextResponse } from 'next/server';
import { sendPushToAdmins } from '@/lib/apns';

/**
 * POST /api/push-diag/test-booking
 * Test sendPushToAdmins trực tiếp (code đã fix token priority)
 */
export async function POST() {
  try {
    await sendPushToAdmins(
      '📅 Lịch hẹn mới (BOOKING TEST)!',
      'Khách hàng Test đặt Massage lúc 10:00 ngày 11/07',
      { appointmentId: 'test-booking-123' }
    );
    return NextResponse.json({ sent: true, message: 'sendPushToAdmins called successfully' });
  } catch (error: any) {
    return NextResponse.json({ sent: false, error: error.message }, { status: 500 });
  }
}
