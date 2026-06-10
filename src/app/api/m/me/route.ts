import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * API nhẹ trả về thông tin user hiện tại.
 * Gọi riêng biệt để không block UI trang chủ.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ name: '', isAdmin: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, role: true },
    });

    return NextResponse.json({
      name: user?.name || '',
      isAdmin: user?.role === 'ADMIN',
    });
  } catch {
    return NextResponse.json({ name: '', isAdmin: false });
  }
}
