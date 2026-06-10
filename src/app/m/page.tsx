import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import HomeContent from './HomeContent';

// ISR: revalidate mỗi 60 giây thay vì fetch mới mỗi lần truy cập
export const revalidate = 60;

export default async function MobileHomePage() {
  const session = await auth();

  // Chuẩn bị các Promise truy vấn đồng thời - chỉ select trường cần thiết
  const userPromise = session?.user?.id
    ? prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, role: true },
      })
    : Promise.resolve(null);

  const categoriesPromise = prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, icon: true },
    orderBy: { sortOrder: 'asc' },
  });

  const bannerPromise = prisma.setting.findUnique({
    where: { key: 'promo_banner' },
    select: { value: true },
  });
  const promoTextPromise = prisma.setting.findUnique({
    where: { key: 'promo_text' },
    select: { value: true },
  });

  // Query staff nhẹ hơn: chỉ lấy reviews thay vì tất cả appointments
  const topStaffPromise = prisma.employee.findMany({
    where: { isAvailable: true, user: { isActive: true } },
    select: {
      id: true,
      user: { select: { name: true, avatar: true } },
      images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
      _count: { select: { appointments: { where: { status: 'COMPLETED', review: { isNot: null } } } } },
    },
    take: 5,
  });

  // Query riêng rating trung bình cho staff (nhẹ hơn nhiều so với load toàn bộ appointments)
  const staffRatingsPromise = prisma.review.groupBy({
    by: ['customerId'],
    _avg: { rating: true },
    _count: { rating: true },
  });

  // Thực thi song song tất cả các truy vấn DB
  const [user, categories, bannerSetting, promoTextSetting, topStaff] = await Promise.all([
    userPromise,
    categoriesPromise,
    bannerPromise,
    promoTextPromise,
    topStaffPromise,
  ]);

  // Lấy rating cho từng staff qua query riêng (nếu có ít staff thì rất nhanh)
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

  let userName = '';
  let isAdmin = false;
  if (user) {
    userName = user.name;
    isAdmin = user.role === 'ADMIN';
  }

  const promoBanner = bannerSetting?.value || null;
  const promoText = promoTextSetting?.value || '';

  // Tính rating theo từng employee (group by employeeId)
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

  return (
    <HomeContent
      userName={userName}
      isAdmin={isAdmin}
      promoBanner={promoBanner}
      promoText={promoText}
      categories={categories}
      staffWithRating={staffWithRating}
    />
  );
}
