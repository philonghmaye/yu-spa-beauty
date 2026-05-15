/**
 * Zalo OA API Client — STUB
 * 
 * This is a placeholder for the Zalo OA integration.
 * To enable real Zalo notifications:
 * 1. Register an Official Account at https://oa.zalo.me
 * 2. Get Access Token from Zalo Business dashboard
 * 3. Set ZALO_OA_ACCESS_TOKEN and ZALO_OA_ID in .env
 * 4. Implement sendZaloMessage() with actual API calls
 */

const ZALO_OA_ACCESS_TOKEN = process.env.ZALO_OA_ACCESS_TOKEN;
const ZALO_OA_ID = process.env.ZALO_OA_ID;

interface ZaloMessageResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

/**
 * Send a message via Zalo OA to a phone number
 * STUB — logs message to console in development
 */
export async function sendZaloMessage(
  phone: string,
  message: string
): Promise<ZaloMessageResult> {
  if (!ZALO_OA_ACCESS_TOKEN || !ZALO_OA_ID) {
    console.log(`📱 [Zalo OA Stub] To: ${phone}`);
    console.log(`   Message: ${message}`);
    return { success: true, messageId: `stub-${Date.now()}` };
  }

  // TODO: Implement real Zalo OA API call
  // Reference: https://developers.zalo.me/docs/api/official-account-api
  //
  // const response = await fetch('https://openapi.zalo.me/v3.0/oa/message/cs', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'access_token': ZALO_OA_ACCESS_TOKEN,
  //   },
  //   body: JSON.stringify({
  //     recipient: { user_id: phone },
  //     message: { text: message },
  //   }),
  // });

  console.log(`📱 [Zalo OA] Sending to ${phone}: ${message.substring(0, 50)}...`);
  return { success: true, messageId: `stub-${Date.now()}` };
}

/**
 * Send a booking reminder via Zalo
 */
export async function sendZaloReminder(
  phone: string,
  customerName: string,
  appointmentDate: string,
  startTime: string,
  serviceName: string,
  reminderType: '24H' | '2H'
): Promise<ZaloMessageResult> {
  const timeLabel = reminderType === '24H' ? 'ngày mai' : 'trong 2 giờ tới';

  const message = [
    `✨ YURI SPA BEAUTY — Nhắc lịch hẹn`,
    ``,
    `Xin chào ${customerName},`,
    `Bạn có lịch hẹn ${timeLabel}:`,
    `📅 Ngày: ${appointmentDate}`,
    `🕐 Giờ: ${startTime}`,
    `💇 Dịch vụ: ${serviceName}`,
    ``,
    `Vui lòng đến đúng giờ để được phục vụ tốt nhất!`,
    `Hotline: 0900 000 000`,
  ].join('\n');

  return sendZaloMessage(phone, message);
}
