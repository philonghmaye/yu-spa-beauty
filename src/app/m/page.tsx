import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import HomeContent from './HomeContent';

export default async function MobileHomePage() {
  const session = await auth();

  // Get user info if logged in
  let userName = '';
  let isAdmin = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, avatar: true, role: true },
    });
    if (user) {
      userName = user.name;
      isAdmin = user.role === 'ADMIN';
    }
  }

  // Get service categories for cards
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: { services: { where: { isActive: true }, take: 1 } },
    orderBy: { sortOrder: 'asc' },
  });

  // Get promo banner setting
  const bannerSetting = await prisma.setting.findUnique({ where: { key: 'promo_banner' } });
  const promoBanner = bannerSetting?.value || null;

  // Get promo text setting
  const promoTextSetting = await prisma.setting.findUnique({ where: { key: 'promo_text' } });
  const promoText = promoTextSetting?.value || '';

  // Get top staff for quick preview
  const topStaff = await prisma.employee.findMany({
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
