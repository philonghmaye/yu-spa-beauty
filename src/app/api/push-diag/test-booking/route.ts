import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/push-diag/test-booking
 * Debug: so sánh token test vs token sendPushToAdmins dùng
 */
export async function POST() {
  const crypto = await import('crypto');
  const http2 = await import('http2');
  
  const results: any = { steps: [] };
  
  try {
    // Step 1: Check env vars
    const keyId = process.env.APNS_KEY_ID;
    const teamId = process.env.APNS_TEAM_ID;
    const privateKeyRaw = process.env.APNS_KEY_P8;
    results.steps.push({ step: 'env_check', keyId: !!keyId, teamId: !!teamId, hasKey: !!privateKeyRaw });

    // Step 2: Check what token sendPushToAdmins would use
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true, name: true },
    });
    results.steps.push({ step: 'admin_users', count: adminUsers.length, ids: adminUsers.map(u => u.id) });

    const adminIds = adminUsers.map(u => u.id);
    const pushTokens = await prisma.pushToken.findMany({
      where: { userId: { in: adminIds } },
    });
    results.steps.push({ step: 'push_tokens_table', count: pushTokens.length, tokens: pushTokens.map(t => t.token.substring(0, 20) + '...') });

    // Step 3: Check Setting fallback
    const settingToken = await prisma.setting.findUnique({ where: { key: 'apns_device_token' } });
    results.steps.push({ step: 'setting_token', exists: !!settingToken?.value, token: settingToken?.value?.substring(0, 20) + '...' });

    // Step 4: Determine which token would be used
    let tokenList = pushTokens.map(t => t.token);
    let tokenSource = 'PushToken table';
    if (tokenList.length === 0 && settingToken?.value) {
      tokenList = [settingToken.value];
      tokenSource = 'Setting fallback';
    }
    results.steps.push({ step: 'token_used', source: tokenSource, count: tokenList.length, token: tokenList[0]?.substring(0, 20) + '...' });

    if (tokenList.length === 0) {
      results.error = 'No tokens found anywhere';
      return NextResponse.json(results);
    }

    // Step 5: Create JWT (same as apns.ts)
    const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: keyId })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({ iss: teamId, iat: now })).toString('base64url');
    const signInput = `${header}.${payload}`;
    
    const privateKey = privateKeyRaw!.replace(/\\n/g, '\n');
    const key = crypto.createPrivateKey(privateKey);
    const sign = crypto.createSign('SHA256');
    sign.update(signInput);
    const signature = sign.sign({ key, dsaEncoding: 'ieee-p1363' });
    const jwt = `${signInput}.${signature.toString('base64url')}`;
    results.steps.push({ step: 'jwt_created', length: jwt.length });

    // Step 6: Send push via HTTP/2 (same as sendPushToDevice)
    const deviceToken = tokenList[0];
    const bundleId = 'com.yurispa.beauty';
    const apnsPayload = JSON.stringify({
      aps: {
        alert: { title: '📅 Lịch hẹn mới (DEBUG)!', body: 'Test qua sendPushToAdmins flow' },
        sound: 'default',
        badge: 1,
      },
    });

    // Try production first
    const sendResult = await new Promise<any>((resolve) => {
      const client = http2.connect('https://api.push.apple.com');
      client.on('error', (err) => {
        client.close();
        resolve({ ok: false, error: err.message });
      });

      const req = client.request({
        ':method': 'POST',
        ':path': `/3/device/${deviceToken}`,
        'authorization': `bearer ${jwt}`,
        'apns-topic': bundleId,
        'apns-push-type': 'alert',
        'apns-priority': '10',
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(apnsPayload),
      });

      let data = '';
      let status = 0;
      req.on('response', (headers) => { status = headers[':status'] as number; });
      req.on('data', (chunk) => { data += chunk; });
      req.on('end', () => {
        client.close();
        resolve({ ok: status === 200, status, body: data || null });
      });
      req.on('error', (err) => {
        client.close();
        resolve({ ok: false, error: err.message });
      });
      req.write(apnsPayload);
      req.end();
    });

    results.steps.push({ step: 'apns_result', ...sendResult });
    results.success = sendResult.ok;

    return NextResponse.json(results);
  } catch (error: any) {
    results.error = error.message;
    results.stack = error.stack;
    return NextResponse.json(results, { status: 500 });
  }
}
