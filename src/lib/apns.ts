/**
 * APNs (Apple Push Notification service) Module
 * Gửi push notification đến iPhone qua HTTP/2 APNs API
 * Sử dụng JWT authentication (Token-Based)
 */

import prisma from '@/lib/prisma';

// JWT cho APNs cần ES256 signing
async function createAPNsJWT(): Promise<string> {
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const privateKey = process.env.APNS_KEY_P8;

  if (!keyId || !teamId || !privateKey) {
    throw new Error('APNs credentials not configured');
  }

  const crypto = await import('crypto');

  // Header
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: keyId })).toString('base64url');

  // Payload
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ iss: teamId, iat: now })).toString('base64url');

  // Sign
  const signInput = `${header}.${payload}`;
  const key = crypto.createPrivateKey(privateKey.replace(/\\n/g, '\n'));
  const sign = crypto.createSign('SHA256');
  sign.update(signInput);
  const signature = sign.sign(key);

  // Convert DER signature to raw r||s format for ES256
  const derToRaw = (der: Buffer): Buffer => {
    // DER: 30 <len> 02 <rLen> <r> 02 <sLen> <s>
    let offset = 2; // skip 30 <len>
    offset += 1; // skip 02
    const rLen = der[offset];
    offset += 1;
    const r = der.subarray(offset, offset + rLen);
    offset += rLen;
    offset += 1; // skip 02
    const sLen = der[offset];
    offset += 1;
    const s = der.subarray(offset, offset + sLen);

    // Pad to 32 bytes each
    const rPad = Buffer.alloc(32);
    const sPad = Buffer.alloc(32);
    r.copy(rPad, 32 - r.length);
    s.copy(sPad, 32 - s.length);

    return Buffer.concat([rPad, sPad]);
  };

  const rawSig = derToRaw(signature);
  const sig64 = rawSig.toString('base64url');

  return `${signInput}.${sig64}`;
}

// Cache JWT token (valid for 1 hour, refresh every 50 min)
let cachedJWT: { token: string; createdAt: number } | null = null;

async function getAPNsToken(): Promise<string> {
  const now = Date.now();
  if (cachedJWT && now - cachedJWT.createdAt < 50 * 60 * 1000) {
    return cachedJWT.token;
  }
  const token = await createAPNsJWT();
  cachedJWT = { token, createdAt: now };
  return token;
}

/**
 * Gửi push notification đến 1 device
 */
async function sendPushToDevice(
  deviceToken: string,
  title: string,
  body: string,
  badgeCount: number,
  data?: Record<string, string>
): Promise<boolean> {
  const bundleId = process.env.APNS_BUNDLE_ID || 'com.yurispa.beauty';
  const isProduction = process.env.APNS_ENVIRONMENT !== 'development';
  const primaryHost = isProduction
    ? 'https://api.push.apple.com'
    : 'https://api.sandbox.push.apple.com';
  const fallbackHost = isProduction
    ? 'https://api.sandbox.push.apple.com'
    : 'https://api.push.apple.com';

  try {
    const jwt = await getAPNsToken();

    const payload = JSON.stringify({
      aps: {
        alert: { title, body },
        sound: 'default',
        badge: badgeCount,
        'mutable-content': 1,
      },
      ...data,
    });

    const sendToHost = async (host: string): Promise<{ ok: boolean; status?: number; error?: any }> => {
      const http2 = await import('http2');
      const hostname = host.replace('https://', '');
      
      return new Promise((resolve) => {
        const client = http2.connect(`https://${hostname}`);
        
        client.on('error', (err) => {
          client.close();
          resolve({ ok: false, error: { reason: err.message } });
        });

        const req = client.request({
          ':method': 'POST',
          ':path': `/3/device/${deviceToken}`,
          'authorization': `bearer ${jwt}`,
          'apns-topic': bundleId,
          'apns-push-type': 'alert',
          'apns-priority': '10',
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload),
        });

        let data = '';
        let status = 0;

        req.on('response', (headers) => {
          status = headers[':status'] as number;
        });

        req.on('data', (chunk) => {
          data += chunk;
        });

        req.on('end', () => {
          client.close();
          if (status === 200) {
            resolve({ ok: true });
          } else {
            const error = data ? JSON.parse(data) : {};
            resolve({ ok: false, status, error });
          }
        });

        req.on('error', (err) => {
          client.close();
          resolve({ ok: false, error: { reason: err.message } });
        });

        req.write(payload);
        req.end();
      });
    };

    let result = await sendToHost(primaryHost);

    // If BadDeviceToken, the token might belong to the other environment (TestFlight vs Xcode debug)
    if (!result.ok && result.error?.reason === 'BadDeviceToken') {
      console.log(`Token failed on primary host, retrying on fallback host...`);
      result = await sendToHost(fallbackHost);
    }

    if (!result.ok) {
      console.error(`APNs error for ${deviceToken.slice(0, 8)}...:`, result.status, result.error);
      
      // Token không hợp lệ → xóa khỏi DB
      if (result.status === 410 || result.error?.reason === 'Unregistered' || result.error?.reason === 'BadDeviceToken') {
        await prisma.pushToken.deleteMany({ where: { token: deviceToken } });
        console.log(`Deleted invalid push token: ${deviceToken.slice(0, 8)}...`);
      }
      return false;
    }

    return true;
  } catch (error) {
    console.error('APNs send error:', error);
    return false;
  }
}

/**
 * Gửi push notification đến TẤT CẢ admin devices
 */
export async function sendPushToAdmins(
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  // Kiểm tra APNs đã cấu hình chưa
  if (!process.env.APNS_KEY_ID || !process.env.APNS_TEAM_ID || !process.env.APNS_KEY_P8) {
    console.log('APNs not configured, skipping push notification');
    return;
  }

  try {
    // Lấy tất cả admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true },
    });

    if (adminUsers.length === 0) return;

    const adminIds = adminUsers.map((u) => u.id);

    // Lấy tất cả push tokens của admin
    const tokens = await prisma.pushToken.findMany({
      where: { userId: { in: adminIds } },
    });

    if (tokens.length === 0) {
      console.log('No admin push tokens found');
      return;
    }

    // Đếm số đơn chờ xác nhận để cập nhật badge trên icon app
    const pendingCount = await prisma.appointment.count({
      where: { status: 'PENDING' },
    });

    // Gửi push đến tất cả devices (parallel)
    const results = await Promise.allSettled(
      tokens.map((t) => sendPushToDevice(t.token, title, body, pendingCount, data))
    );

    const sent = results.filter((r) => r.status === 'fulfilled' && r.value).length;
    console.log(`Push notification sent to ${sent}/${tokens.length} admin devices`);
  } catch (error) {
    console.error('Failed to send push to admins:', error);
  }
}
