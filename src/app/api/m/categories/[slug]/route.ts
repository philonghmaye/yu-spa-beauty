import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 120;

/**
 * API trả về chi tiết danh mục + danh sách dịch vụ
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const category = await prisma.category.findFirst({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
            discountPrice: true,
            duration: true,
            image: true,
            description: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(category, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
