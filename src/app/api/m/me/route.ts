import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * API nhẹ trả về thông tin user hiện tại.
 * Gọi riêng biệt để không block UI.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ id: undefined, name: '', isAdmin: false, phone: '', email: '' });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, role: true, phone: true, email: true },
    });

    return NextResponse.json({
      id: session.user.id,
      name: user?.name || '',
      isAdmin: user?.role === 'ADMIN',
      phone: user?.phone || '',
      email: user?.email || '',
    });
  } catch {
    return NextResponse.json({ id: undefined, name: '', isAdmin: false, phone: '', email: '' });
  }
}
