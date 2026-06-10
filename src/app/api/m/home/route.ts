import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Cache kết quả 2 phút trên Vercel Edge — giảm DB cold start impact
export const revalidate = 120;

/**
 * API trả về toàn bộ data trang chủ mobile trong 1 request duy nhất.
 * Thay vì server component gọi 6 queries riêng lẻ (chờ cold start),
 * client fetch 1 lần từ edge cache.
 */
export async function GET() {
  try {
    // Chạy song song tất cả queries
    const [categories, bannerSetting, promoTextSetting, topStaff] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, icon: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.setting.findUnique({
        where: { key: 'promo_banner' },
        select: { value: true },
      }),
      prisma.setting.findUnique({
        where: { key: 'promo_text' },
        select: { value: true },
      }),
      prisma.employee.findMany({
        where: { isAvailable: true, user: { isActive: true } },
        select: {
          id: true,
          user: { select: { name: true, avatar: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
        },
        take: 5,
      }),
    ]);

    // Lấy rating cho staff
    const staffIds = topStaff.map(s => s.id);
    const staffReviews = staffIds.length > 0 ? await prisma.review.findMany({
      where: {
        appointment: {
          employeeId: { in: staffIds },
          status: 'COMPLETED',
        },
      },
      select: {
        rating: true,
        appointment: { select: { employeeId: true } },
      },
    }) : [];

    // Tính rating theo từng employee
    const ratingMap = new Map<string, { total: number; count: number }>();
    for (const r of staffReviews) {
      const empId = r.appointment?.employeeId;
      if (!empId) continue;
      const entry = ratingMap.get(empId) || { total: 0, count: 0 };
      entry.total += r.rating;
      entry.count += 1;
      ratingMap.set(empId, entry);
    }

    const staffWithRating = topStaff.map((s) => {
      const entry = ratingMap.get(s.id);
      const avg = entry && entry.count > 0
        ? Math.round((entry.total / entry.count) * 10) / 10
        : 5.0;
      return {
        id: s.id,
        rating: avg,
        reviewCount: entry?.count || 0,
        user: s.user,
        images: s.images,
      };
    });

    return NextResponse.json({
      categories,
      promoBanner: bannerSetting?.value || null,
      promoText: promoTextSetting?.value || '',
      staffWithRating,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Home API error:', error);
    return NextResponse.json({
      categories: [],
      promoBanner: null,
      promoText: '',
      staffWithRating: [],
    }, { status: 500 });
  }
}
