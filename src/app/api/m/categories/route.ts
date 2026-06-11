import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Cache kết quả 2 phút trên Vercel Edge
export const revalidate = 120;

/**
 * API trả về danh mục dịch vụ — rất nhẹ, dùng cho client-side fetching
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, icon: true, image: true },
      orderBy: { sortOrder: 'asc' },
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
