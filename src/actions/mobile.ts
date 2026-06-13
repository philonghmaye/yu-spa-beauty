'use server';

import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

/** Get staff list for mobile with ratings — CACHED 2 phút */
export const getStaffForMobile = unstable_cache(
  async () => {
    // Query 1: Lấy thông tin cơ bản nhân viên + skills (KHÔNG load appointments)
    const staff = await prisma.employee.findMany({
      where: { isAvailable: true, user: { isActive: true } },
      include: {
        user: { select: { id: true, name: true, avatar: true, createdAt: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        skills: {
          include: {
            service: {
              select: {
                id: true, name: true, price: true, discountPrice: true,
                duration: true, categoryId: true,
                category: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    // Query 2: Lấy rating trung bình & số lượng review cho tất cả staff cùng lúc
    const staffIds = staff.map(s => s.id);

    // Tính rating theo employeeId hiệu quả hơn
    const reviewsByEmployee = staffIds.length > 0 ? await prisma.review.findMany({
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

    const ratingMap = new Map<string, { total: number; count: number }>();
    for (const r of reviewsByEmployee) {
      const empId = r.appointment?.employeeId;
      if (!empId) continue;
      const entry = ratingMap.get(empId) || { total: 0, count: 0 };
      entry.total += r.rating;
      entry.count += 1;
      ratingMap.set(empId, entry);
    }

    return staff.map((s) => {
      const rEntry = ratingMap.get(s.id);
      const avgRating = rEntry && rEntry.count > 0
        ? Math.round((rEntry.total / rEntry.count) * 10) / 10
        : 5.0;
      const isNew = (Date.now() - new Date(s.user.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000;

      return {
        id: s.id,
        name: s.user.name,
        avatar: s.images[0]?.url || s.user.avatar,
        rating: avgRating,
        reviewCount: rEntry?.count || 0,
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
  },
  ['staff-mobile-list'],
  { revalidate: 120, tags: ['staff'] }
);

/** Get single staff detail — CACHED 60 giây */
export async function getStaffDetail(id: string) {
  return unstable_cache(
    async () => {
      // Query 1: Thông tin cơ bản (KHÔNG load appointments)
      const staff = await prisma.employee.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          images: { orderBy: { sortOrder: 'asc' } },
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
          schedules: { where: { isActive: true } },
        },
      });

      if (!staff) return null;

      // Query 2: Chỉ lấy reviews (nhẹ hơn nhiều so với load toàn bộ appointments)
      const reviews = await prisma.review.findMany({
        where: {
          appointment: {
            employeeId: id,
            status: 'COMPLETED',
          },
        },
        select: {
          rating: true,
          comment: true,
          createdAt: true,
          customer: {
            select: { user: { select: { name: true, avatar: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Lấy tổng số reviews và rating trung bình
      const reviewAgg = await prisma.review.aggregate({
        where: {
          appointment: {
            employeeId: id,
            status: 'COMPLETED',
          },
        },
        _avg: { rating: true },
        _count: { rating: true },
      });

      const avgRating = reviewAgg._avg.rating
        ? Math.round(reviewAgg._avg.rating * 10) / 10
        : 5.0;
      const reviewCount = reviewAgg._count.rating;

      // Rating distribution
      const ratingDist = [0, 0, 0, 0, 0];
      reviews.forEach((r) => {
        if (r.rating >= 1 && r.rating <= 5) ratingDist[r.rating - 1]++;
      });

      return {
        id: staff.id,
        name: staff.user.name,
        avatar: staff.user.avatar,
        images: staff.images.map((img) => ({ id: img.id, url: img.url })),
        bio: staff.bio,
        position: staff.position,
        experience: staff.experience,
        rating: avgRating,
        reviewCount,
        ratingDistribution: ratingDist,
        reviews: reviews.map((r) => ({
          rating: r.rating,
          comment: r.comment,
          date: r.createdAt.toISOString(),
          customerName: r.customer.user.name,
          customerAvatar: r.customer.user.avatar,
        })),
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
    },
    [`staff-detail-${id}`],
    { revalidate: 60, tags: ['staff'] }
  )();
}

/** Get customer activity for mobile */
export async function getCustomerActivity(userId: string, filter?: string) {
  const customer = await prisma.customer.findFirst({
    where: { userId },
    select: { id: true },
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
    select: {
      id: true,
      appointmentDate: true,
      startTime: true,
      endTime: true,
      status: true,
      finalAmount: true,
      employeeId: true,
      services: { select: { service: { select: { name: true } } } },
      employee: { select: { user: { select: { name: true } } } },
      review: { select: { id: true, rating: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  return appointments.map((a) => ({
    id: a.id,
    date: a.appointmentDate,
    startTime: a.startTime,
    endTime: a.endTime,
    status: a.status,
    services: a.services.map((s) => s.service.name),
    employeeName: a.employee?.user.name || null,
    employeeId: a.employeeId || null,
    totalAmount: a.finalAmount,
    hasReview: !!a.review,
    reviewRating: a.review?.rating || null,
  }));
}

