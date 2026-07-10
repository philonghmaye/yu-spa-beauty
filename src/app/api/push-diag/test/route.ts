import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import http2 from 'http2';
import crypto from 'crypto';

/**
 * POST /api/push-diag/test
 * Gửi test push notification trực tiếp dùng HTTP/2 (APNs yêu cầu)
 */
export async function POST() {
  try {
    // Get token
    const tokenSetting = await prisma.setting.findUnique({ where: { key: 'apns_device_token' } });
    
    if (!tokenSetting?.value) {
      return NextResponse.json({ error: 'No device token found. Open the app first.' }, { status: 404 });
    }
    
    const deviceToken = tokenSetting.value;

    // Get APNs config
    const keyId = process.env.APNS_KEY_ID;
    const teamId = process.env.APNS_TEAM_ID;
    const privateKeyRaw = process.env.APNS_KEY_P8;
    const bundleId = process.env.APNS_BUNDLE_ID || 'com.yurispa.beauty';

    if (!keyId || !teamId || !privateKeyRaw) {
      return NextResponse.json({ error: 'APNs not configured', has: { keyId: !!keyId, teamId: !!teamId, keyP8: !!privateKeyRaw } }, { status: 500 });
    }

    // Create JWT
    const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: keyId })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({ iss: teamId, iat: now })).toString('base64url');
    const signInput = `${header}.${payload}`;
    
    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
    const key = crypto.createPrivateKey(privateKey);
    const sign = crypto.createSign('SHA256');
    sign.update(signInput);
    const signature = sign.sign(key);

    // DER to raw ES256
    let offset = 2;
    offset += 1;
    const rLen = signature[offset];
    offset += 1;
    const r = signature.subarray(offset, offset + rLen);
    offset += rLen;
    offset += 1;
    const sLen = signature[offset];
    offset += 1;
    const s = signature.subarray(offset, offset + sLen);
    const rPad = Buffer.alloc(32);
    const sPad = Buffer.alloc(32);
    r.copy(rPad, 32 - r.length);
    s.copy(sPad, 32 - s.length);
    const rawSig = Buffer.concat([rPad, sPad]);
    const jwt = `${signInput}.${rawSig.toString('base64url')}`;

    // APNs payload
    const apnsPayload = JSON.stringify({
      aps: {
        alert: {
          title: '🎉 Test thành công!',
          body: 'Push notification hoạt động! Yuri Spa Beauty xin chào.'
        },
        sound: 'default',
        badge: 1,
      }
    });

    // Try both production (TestFlight) and sandbox
    const hosts = ['api.push.apple.com', 'api.sandbox.push.apple.com'];
    const results: any[] = [];

    for (const host of hosts) {
      try {
        const result = await sendHTTP2(host, deviceToken, jwt, bundleId, apnsPayload);
        results.push({ host: host.includes('sandbox') ? 'sandbox' : 'production', ...result });
        if (result.ok) break;
      } catch (err: any) {
        results.push({ host: host.includes('sandbox') ? 'sandbox' : 'production', error: err.message });
      }
    }

    return NextResponse.json({
      sent: results.some(r => r.ok),
      token: deviceToken.substring(0, 20) + '...',
      results
    });
  } catch (error: any) {
    console.error('Test push error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function sendHTTP2(host: string, deviceToken: string, jwt: string, bundleId: string, payload: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = http2.connect(`https://${host}`);
    
    client.on('error', (err) => {
      client.close();
      reject(err);
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
      resolve({
        ok: status === 200,
        status,
        body: data || null
      });
    });

    req.on('error', (err) => {
      client.close();
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}
