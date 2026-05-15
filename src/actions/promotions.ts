'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getPromotions(filter?: { isActive?: boolean }) {
  const where: Record<string, unknown> = {};
  if (filter?.isActive !== undefined) where.isActive = filter.isActive;

  return prisma.promotion.findMany({
    where,
    include: { _count: { select: { appointments: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPromotionById(id: string) {
  return prisma.promotion.findUnique({
    where: { id },
    include: { appointments: { take: 10, orderBy: { createdAt: 'desc' } } },
  });
}

export async function createPromotion(data: {
  name: string;
  code: string;
  description?: string;
  type: string;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
}) {
  const existing = await prisma.promotion.findUnique({ where: { code: data.code.toUpperCase() } });
  if (existing) throw new Error('Mã giảm giá đã tồn tại');

  const promotion = await prisma.promotion.create({
    data: {
      name: data.name,
      code: data.code.toUpperCase(),
      description: data.description || null,
      type: data.type,
      value: data.value,
      minOrderValue: data.minOrderValue || null,
      maxDiscount: data.maxDiscount || null,
      usageLimit: data.usageLimit || null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });

  revalidatePath('/admin/khuyen-mai');
  return promotion;
}

export async function updatePromotion(id: string, data: {
  name?: string;
  description?: string;
  type?: string;
  value?: number;
  minOrderValue?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}) {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.value !== undefined) updateData.value = data.value;
  if (data.minOrderValue !== undefined) updateData.minOrderValue = data.minOrderValue;
  if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount;
  if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit;
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const promotion = await prisma.promotion.update({ where: { id }, data: updateData });
  revalidatePath('/admin/khuyen-mai');
  return promotion;
}

export async function deletePromotion(id: string) {
  await prisma.promotion.update({ where: { id }, data: { isActive: false } });
  revalidatePath('/admin/khuyen-mai');
}

export async function togglePromotionActive(id: string) {
  const promo = await prisma.promotion.findUnique({ where: { id } });
  if (!promo) throw new Error('Không tìm thấy khuyến mãi');
  await prisma.promotion.update({ where: { id }, data: { isActive: !promo.isActive } });
  revalidatePath('/admin/khuyen-mai');
}
