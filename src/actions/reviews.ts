'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getReviews() {
  return prisma.review.findMany({
    include: {
      customer: { include: { user: { select: { name: true, phone: true, avatar: true } } } },
      appointment: {
        include: {
          services: { include: { service: { select: { name: true } } } },
          employee: { include: { user: { select: { name: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getReviewStats() {
  const total = await prisma.review.count();
  const avgRating = await prisma.review.aggregate({ _avg: { rating: true } });
  const byRating = await prisma.review.groupBy({ by: ['rating'], _count: true, orderBy: { rating: 'desc' } });
  return { total, avgRating: avgRating._avg.rating || 0, byRating };
}

export async function deleteReview(id: string) {
  await prisma.review.delete({ where: { id } });
  revalidatePath('/admin/danh-gia');
  revalidatePath('/');
}
