import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET: get banner setting
export async function GET() {
  const setting = await prisma.setting.findUnique({ where: { key: 'promo_banner' } });
  return NextResponse.json({ value: setting?.value || null });
}

// POST: update banner setting (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { value, key } = await req.json();

  // Support both promo_banner (default) and promo_text
  const settingKey = key === 'promo_text' ? 'promo_text' : 'promo_banner';

  await prisma.setting.upsert({
    where: { key: settingKey },
    update: { value },
    create: { key: settingKey, value },
  });

  return NextResponse.json({ success: true });
}
