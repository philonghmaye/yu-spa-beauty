import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Save diagnostic data from native AppDelegate
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { status, detail, token, isRegistered, bundleId, timestamp, buildVersion } = body;
    
    const diagData = JSON.stringify({
      status,
      detail,
      token: token ? token.substring(0, 20) + '...' : '',
      fullToken: token || '',
      isRegistered,
      bundleId,
      timestamp,
      buildVersion,
      receivedAt: new Date().toISOString()
    });
    
    // Save latest diagnostic
    await prisma.setting.upsert({
      where: { key: 'push_diag_latest' },
      update: { value: diagData },
      create: { key: 'push_diag_latest', value: diagData }
    });
    
    // Keep log of events (max 20)
    const existing = await prisma.setting.findUnique({ where: { key: 'push_diag_log' } });
    const log = existing ? JSON.parse(existing.value) : [];
    log.push({ status, detail, token: token ? 'yes' : 'no', isRegistered, timestamp, buildVersion });
    const trimmedLog = log.slice(-20);
    
    await prisma.setting.upsert({
      where: { key: 'push_diag_log' },
      update: { value: JSON.stringify(trimmedLog) },
      create: { key: 'push_diag_log', value: JSON.stringify(trimmedLog) }
    });
    
    // If we got a token, save it
    if (token) {
      await prisma.setting.upsert({
        where: { key: 'apns_device_token' },
        update: { value: token },
        create: { key: 'apns_device_token', value: token }
      });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Push diag error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Read diagnostic data for admin page
export async function GET() {
  try {
    const latest = await prisma.setting.findUnique({ where: { key: 'push_diag_latest' } });
    const log = await prisma.setting.findUnique({ where: { key: 'push_diag_log' } });
    
    return NextResponse.json({
      latest: latest ? JSON.parse(latest.value) : null,
      log: log ? JSON.parse(log.value) : []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
