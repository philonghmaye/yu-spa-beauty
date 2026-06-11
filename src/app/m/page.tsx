import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import HomeContent from './HomeContent';

export default async function MobileHomePage() {
  const session = await auth();

  // Run all DB queries in parallel for faster page load
  const [user, categories, settings, topStaff] = await Promise.all([
    // Get user info if logged in
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, avatar: true, role: true },
        })
      : null,

    // Get service categories for cards
    prisma.category.findMany({
      where: { isActive: true },
      include: { services: { where: { isActive: true }, take: 1 } },
      orderBy: { sortOrder: 'asc' },
    }),

    // Get promo settings in one query (banner + text)
    prisma.setting.findMany({
      where: { key: { in: ['promo_banner', 'promo_text'] } },
    }),

    // Get top staff for quick preview
    prisma.employee.findMany({
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
    }),
  ]);

  const userName = user?.name || '';
  const isAdmin = user?.role === 'ADMIN';
  const promoBanner = settings.find(s => s.key === 'promo_banner')?.value || null;
  const promoText = settings.find(s => s.key === 'promo_text')?.value || '';

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
