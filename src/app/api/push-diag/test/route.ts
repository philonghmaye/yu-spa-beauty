import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/push-diag/test
 * Gửi test push notification trực tiếp đến token từ native diagnostic
 */
export async function POST() {
  try {
    // Get token from push-diag data
    const diagLatest = await prisma.setting.findUnique({ where: { key: 'push_diag_latest' } });
    if (!diagLatest) {
      return NextResponse.json({ error: 'No diagnostic data found' }, { status: 404 });
    }
    
    const diag = JSON.parse(diagLatest.value);
    const fullToken = diag.fullToken;
    
    if (!fullToken) {
      return NextResponse.json({ error: 'No token in diagnostic data' }, { status: 404 });
    }

    // Get APNs config
    const keyId = process.env.APNS_KEY_ID;
    const teamId = process.env.APNS_TEAM_ID;
    const privateKeyRaw = process.env.APNS_KEY_P8;
    const bundleId = process.env.APNS_BUNDLE_ID || 'com.yurispa.beauty';

    if (!keyId || !teamId || !privateKeyRaw) {
      return NextResponse.json({ error: 'APNs not configured', keyId: !!keyId, teamId: !!teamId, keyP8: !!privateKeyRaw }, { status: 500 });
    }

    const crypto = await import('crypto');
    
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
    const derToRaw = (der: Buffer): Buffer => {
      let offset = 2;
      offset += 1;
      const rLen = der[offset];
      offset += 1;
      const r = der.subarray(offset, offset + rLen);
      offset += rLen;
      offset += 1;
      const sLen = der[offset];
      offset += 1;
      const s = der.subarray(offset, offset + sLen);
      const rPad = Buffer.alloc(32);
      const sPad = Buffer.alloc(32);
      r.copy(rPad, 32 - r.length);
      s.copy(sPad, 32 - s.length);
      return Buffer.concat([rPad, sPad]);
    };

    const rawSig = derToRaw(signature);
    const jwt = `${signInput}.${rawSig.toString('base64url')}`;

    // Send push - try production first (TestFlight uses production APNs)
    const apnsPayload = {
      aps: {
        alert: {
          title: '🎉 Test thành công!',
          body: 'Push notification đã hoạt động! Yuri Spa Beauty xin chào bạn.'
        },
        sound: 'default',
        badge: 1,
      }
    };

    const hosts = [
      'https://api.push.apple.com',
      'https://api.sandbox.push.apple.com'
    ];

    const results: any[] = [];

    for (const host of hosts) {
      try {
        const response = await fetch(`${host}/3/device/${fullToken}`, {
          method: 'POST',
          headers: {
            'authorization': `bearer ${jwt}`,
            'apns-topic': bundleId,
            'apns-push-type': 'alert',
            'apns-priority': '10',
            'apns-expiration': '0',
            'content-type': 'application/json',
          },
          body: JSON.stringify(apnsPayload),
        });

        const responseBody = response.ok ? null : await response.text().catch(() => '');
        results.push({
          host: host.includes('sandbox') ? 'sandbox' : 'production',
          status: response.status,
          ok: response.ok,
          body: responseBody
        });

        if (response.ok) break;
      } catch (err: any) {
        results.push({
          host: host.includes('sandbox') ? 'sandbox' : 'production',
          error: err.message
        });
      }
    }

    return NextResponse.json({
      sent: results.some(r => r.ok),
      token: fullToken.substring(0, 20) + '...',
      results
    });
  } catch (error: any) {
    console.error('Test push error:', error);
    return NextResponse.json({ error: error.message, stack: error.stack?.split('\n').slice(0, 3) }, { status: 500 });
  }
}
