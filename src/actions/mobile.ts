'use server';

import prisma from '@/lib/prisma';

/** Get staff list for mobile with ratings and review counts */
export async function getStaffForMobile(filter?: string) {
  const staff = await prisma.employee.findMany({
    where: { isAvailable: true, user: { isActive: true } },
    include: {
      user: { select: { id: true, name: true, avatar: true, createdAt: true } },
      skills: {
        include: { service: { select: { id: true, name: true, price: true, discountPrice: true, duration: true, categoryId: true, category: { select: { name: true } } } } },
      },
      appointments: {
        where: { status: 'COMPLETED' },
        select: { review: { select: { rating: true } } },
      },
    },
  });

  return staff.map((s) => {
    const reviews = s.appointments
      .map((a) => a.review)
      .filter((r): r is NonNullable<typeof r> => r !== null);
    const avgRating = reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 5.0;
    const isNew = (Date.now() - new Date(s.user.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000;

    return {
      id: s.id,
      name: s.user.name,
      avatar: s.user.avatar,
      rating: avgRating,
      reviewCount: reviews.length,
      isNew,
      bio: s.bio,
      position: s.position,
      experience: s.experience,
      services: s.skills.map((sk) => ({
        id: sk.service.id,
        name: sk.service.name,
        price: sk.service.price,
        discountPrice: sk.service.discountPrice,
        duration: sk.service.duration,
        category: sk.service.category.name,
      })),
    };
  });
}

/** Get single staff detail */
export async function getStaffDetail(id: string) {
  const staff = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      skills: {
        include: {
          service: {
            select: {
              id: true, name: true, price: true, discountPrice: true,
              duration: true, image: true,
              category: { select: { name: true, icon: true } },
            },
          },
        },
      },
      appointments: {
        where: { status: 'COMPLETED' },
        select: { review: { select: { rating: true } } },
      },
      schedules: { where: { isActive: true } },
    },
  });

  if (!staff) return null;

  const reviews = staff.appointments
    .map((a) => a.review)
    .filter((r): r is NonNullable<typeof r> => r !== null);
  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 5.0;

  return {
    id: staff.id,
    name: staff.user.name,
    avatar: staff.user.avatar,
    bio: staff.bio,
    position: staff.position,
    experience: staff.experience,
    rating: avgRating,
    reviewCount: reviews.length,
    services: staff.skills.map((sk) => ({
      id: sk.service.id,
      name: sk.service.name,
      price: sk.service.price,
      discountPrice: sk.service.discountPrice,
      duration: sk.service.duration,
      image: sk.service.image,
      category: sk.service.category.name,
      categoryIcon: sk.service.category.icon,
    })),
    schedules: staff.schedules,
  };
}

/** Get customer activity for mobile */
export async function getCustomerActivity(userId: string, filter?: string) {
  const customer = await prisma.customer.findFirst({
    where: { userId },
  });

  if (!customer) return [];

  const where: Record<string, unknown> = { customerId: customer.id };
  if (filter === 'upcoming') {
    where.status = { in: ['PENDING', 'CONFIRMED'] };
  } else if (filter === 'completed') {
    where.status = 'COMPLETED';
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      services: { include: { service: { select: { name: true } } } },
      employee: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return appointments.map((a) => ({
    id: a.id,
    date: a.appointmentDate,
    startTime: a.startTime,
    endTime: a.endTime,
    status: a.status,
    services: a.services.map((s) => s.service.name),
    employeeName: a.employee?.user.name || null,
    totalAmount: a.finalAmount,
  }));
}
