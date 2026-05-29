'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getVietnamNow } from '@/lib/utils';
import { requireAdmin } from '@/lib/auth-guard';

export async function getCustomers(search?: string) {
  await requireAdmin();
  const where = search ? {
    user: {
      OR: [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ],
    },
  } : {};

  return prisma.customer.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, phone: true, email: true, isActive: true } },
      appointments: { take: 1, orderBy: { createdAt: 'desc' }, select: { appointmentDate: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      user: true,
      appointments: {
        include: { services: { include: { service: true } }, employee: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      reviews: { include: { appointment: true }, orderBy: { createdAt: 'desc' } },
    },
  });
}

export async function updateCustomerNotes(id: string, notes: string) {
  await prisma.customer.update({ where: { id }, data: { notes } });
  revalidatePath('/admin/khach-hang');
}

export async function updateCustomerLevel(id: string, memberLevel: string) {
  await prisma.customer.update({ where: { id }, data: { memberLevel } });
  revalidatePath('/admin/khach-hang');
}

export async function getCustomerStats() {
  const total = await prisma.customer.count();
  const thisMonth = await prisma.customer.count({
    where: {
      createdAt: { gte: (() => { const vn = getVietnamNow(); return new Date(vn.getFullYear(), vn.getMonth(), 1); })() },
    },
  });
  const levels = await prisma.customer.groupBy({
    by: ['memberLevel'],
    _count: true,
  });
  return { total, thisMonth, levels };
}
