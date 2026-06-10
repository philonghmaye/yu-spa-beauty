import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import HomeContent from './HomeContent';

export default async function MobileHomePage() {
  const session = await auth();

  // Chuẩn bị các Promise truy vấn đồng thời
  const userPromise = session?.user?.id
    ? prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, avatar: true, role: true },
      })
    : Promise.resolve(null);

  const categoriesPromise = prisma.category.findMany({
    where: { isActive: true },
    include: { services: { where: { isActive: true }, take: 1 } },
    orderBy: { sortOrder: 'asc' },
  });

  const bannerPromise = prisma.setting.findUnique({ where: { key: 'promo_banner' } });
  const promoTextPromise = prisma.setting.findUnique({ where: { key: 'promo_text' } });

  const topStaffPromise = prisma.employee.findMany({
    where: { isAvailable: true, user: { isActive: true } },
    include: {
      user: { select: { name: true, avatar: true } },
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      appointments: {
        where: { status: 'COMPLETED' },
        select: { review: { select: { rating: true } } },
      },
    },
    take: 5,
  });

  // Thực thi song song tất cả các truy vấn DB
  const [user, categories, bannerSetting, promoTextSetting, topStaff] = await Promise.all([
    userPromise,
    categoriesPromise,
    bannerPromise,
    promoTextPromise,
    topStaffPromise,
  ]);

  let userName = '';
  let isAdmin = false;
  if (user) {
    userName = user.name;
    isAdmin = user.role === 'ADMIN';
  }

  const promoBanner = bannerSetting?.value || null;
  const promoText = promoTextSetting?.value || '';

  const staffWithRating = topStaff.map((s) => {
    const reviews = s.appointments.map((a) => a.review).filter(Boolean);
    const avg = reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + (r?.rating || 0), 0) / reviews.length) * 10) / 10
      : 5.0;
    return {
      id: s.id,
      rating: avg,
      reviewCount: reviews.length,
      user: s.user,
      images: s.images.map(img => ({ url: img.url })),
    };
  });

  const categoryData = categories.map(c => ({
    id: c.id, name: c.name, slug: c.slug, icon: c.icon,
  }));

  return (
    <HomeContent
      userName={userName}
      isAdmin={isAdmin}
      promoBanner={promoBanner}
      promoText={promoText}
      categories={categoryData}
      staffWithRating={staffWithRating}
    />
  );
}
