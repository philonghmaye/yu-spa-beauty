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

  const { value } = await req.json();

  await prisma.setting.upsert({
    where: { key: 'promo_banner' },
    update: { value },
    create: { key: 'promo_banner', value },
  });

  return NextResponse.json({ success: true });
}
