'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

export async function updateProfile(data: { name: string; phone: string; email: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Chưa đăng nhập');

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
    },
  });

  revalidatePath('/m/tai-khoan');
  revalidatePath('/tai-khoan');
}

export async function getMyProfile(userId: string) {
  return prisma.customer.findFirst({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, phone: true, email: true, avatar: true } },
    },
  });
}

export async function getMyAppointments(userId: string) {
  const customer = await prisma.customer.findFirst({ where: { userId } });
  if (!customer) return [];

  return prisma.appointment.findMany({
    where: { customerId: customer.id },
    include: {
      employee: { include: { user: { select: { name: true } } } },
      services: { include: { service: { select: { name: true, price: true, duration: true } } } },
      review: true,
      promotion: { select: { code: true, name: true } },
    },
    orderBy: [{ appointmentDate: 'desc' }, { startTime: 'desc' }],
  });
}

export async function getMyReviews(userId: string) {
  const customer = await prisma.customer.findFirst({ where: { userId } });
  if (!customer) return [];

  return prisma.review.findMany({
    where: { customerId: customer.id },
    include: {
      appointment: {
        include: {
          services: { include: { service: { select: { name: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createReview(data: {
  appointmentId: string;
  userId: string;
  rating: number;
  comment?: string;
}) {
  const customer = await prisma.customer.findFirst({ where: { userId: data.userId } });
  if (!customer) throw new Error('Không tìm thấy tài khoản khách hàng');

  // Check if appointment belongs to this customer
  const appointment = await prisma.appointment.findFirst({
    where: { id: data.appointmentId, customerId: customer.id, status: 'COMPLETED' },
  });
  if (!appointment) throw new Error('Lịch hẹn không hợp lệ');

  // Check if already reviewed
  const existing = await prisma.review.findUnique({ where: { appointmentId: data.appointmentId } });
  if (existing) throw new Error('Lịch hẹn này đã được đánh giá');

  const review = await prisma.review.create({
    data: {
      customerId: customer.id,
      appointmentId: data.appointmentId,
      rating: data.rating,
      comment: data.comment || null,
    },
  });

  revalidatePath('/tai-khoan/lich-su');
  revalidatePath('/tai-khoan/danh-gia');
  revalidatePath('/');

  return review;
}
