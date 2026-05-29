'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-guard';

// ============ CATEGORIES ============

export async function getCategories() {
  await requireAdmin();
  return prisma.category.findMany({
    include: { services: { where: { isActive: true } } },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function createCategory(data: { name: string; slug: string; description?: string; icon?: string }) {
  const category = await prisma.category.create({ data: { ...data, sortOrder: 0 } });
  revalidatePath('/admin/dich-vu');
  return category;
}

export async function updateCategory(id: string, data: { name?: string; description?: string; icon?: string; isActive?: boolean }) {
  const category = await prisma.category.update({ where: { id }, data });
  revalidatePath('/admin/dich-vu');
  return category;
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin/dich-vu');
}

// ============ SERVICES ============

export async function getServices() {
  return prisma.service.findMany({
    include: { category: true },
    orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
  });
}

export async function getServiceById(id: string) {
  return prisma.service.findUnique({ where: { id }, include: { category: true } });
}

export async function createService(data: {
  name: string; slug: string; categoryId: string; description?: string;
  price: number; discountPrice?: number; duration: number;
  image?: string; isFeatured?: boolean;
}) {
  const service = await prisma.service.create({ data: { ...data, sortOrder: 0 } });
  revalidatePath('/admin/dich-vu');
  revalidatePath('/dich-vu');
  revalidatePath('/bang-gia');
  return service;
}

export async function updateService(id: string, data: {
  name?: string; categoryId?: string; description?: string;
  price?: number; discountPrice?: number | null; duration?: number;
  image?: string; isFeatured?: boolean; isActive?: boolean;
}) {
  const service = await prisma.service.update({ where: { id }, data });
  revalidatePath('/admin/dich-vu');
  revalidatePath('/dich-vu');
  revalidatePath('/bang-gia');
  return service;
}

export async function deleteService(id: string) {
  await prisma.service.update({ where: { id }, data: { isActive: false } });
  revalidatePath('/admin/dich-vu');
  revalidatePath('/dich-vu');
}

export async function toggleServiceActive(id: string) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw new Error('Service not found');
  await prisma.service.update({ where: { id }, data: { isActive: !service.isActive } });
  revalidatePath('/admin/dich-vu');
  revalidatePath('/dich-vu');
}

export async function toggleServiceFeatured(id: string) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw new Error('Service not found');
  await prisma.service.update({ where: { id }, data: { isFeatured: !service.isFeatured } });
  revalidatePath('/admin/dich-vu');
  revalidatePath('/');
}
