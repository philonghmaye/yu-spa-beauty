import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 120;

/**
 * API trả về tất cả categories kèm services — 1 request duy nhất
 * Client cache và hiển thị tức thì khi user chuyển category
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        image: true,
        description: true,
        services: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            discountPrice: true,
            duration: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
