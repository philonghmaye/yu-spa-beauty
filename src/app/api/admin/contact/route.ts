import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

const CONTACT_KEYS = ['contact_address', 'contact_phone', 'contact_email', 'contact_hours'];

const DEFAULTS: Record<string, string> = {
  contact_address: '',
  contact_phone: '',
  contact_email: '',
  contact_hours: '',
};

/**
 * GET /api/admin/contact - Lấy thông tin liên hệ
 */
export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: CONTACT_KEYS } },
    });

    const result = { ...DEFAULTS };
    settings.forEach(s => {
      result[s.key] = s.value;
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}

/**
 * PUT /api/admin/contact - Cập nhật thông tin liên hệ (admin only)
 */
export async function PUT(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const updates = CONTACT_KEYS.filter(key => body[key] !== undefined).map(key =>
      prisma.setting.upsert({
        where: { key },
        update: { value: body[key] },
        create: { key, value: body[key] },
      })
    );

    await Promise.all(updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
