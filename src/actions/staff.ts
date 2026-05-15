'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function getStaffList() {
  return prisma.employee.findMany({
    include: {
      user: { select: { id: true, name: true, phone: true, email: true, avatar: true, isActive: true } },
      skills: { include: { service: { select: { id: true, name: true } } } },
      schedules: { orderBy: { dayOfWeek: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getStaffById(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      user: true,
      skills: { include: { service: true } },
      schedules: { orderBy: { dayOfWeek: 'asc' } },
    },
  });
}

export async function createStaff(data: {
  name: string; phone: string; email?: string; password: string;
  position?: string; bio?: string; experience?: number;
  skillServiceIds?: string[];
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      password: hashedPassword,
      role: 'STAFF',
      employee: {
        create: {
          position: data.position || null,
          bio: data.bio || null,
          experience: data.experience || null,
          skills: data.skillServiceIds ? {
            create: data.skillServiceIds.map(serviceId => ({ serviceId })),
          } : undefined,
          // Default schedule Mon-Sat
          schedules: {
            create: [1, 2, 3, 4, 5, 6].map(day => ({
              dayOfWeek: day,
              startTime: '09:00',
              endTime: '19:00',
            })),
          },
        },
      },
    },
    include: { employee: true },
  });

  revalidatePath('/admin/nhan-vien');
  return user;
}

export async function updateStaff(employeeId: string, data: {
  name?: string; phone?: string; email?: string;
  position?: string; bio?: string; experience?: number;
  isActive?: boolean;
}) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) throw new Error('Employee not found');

  // Update user info
  await prisma.user.update({
    where: { id: employee.userId },
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      isActive: data.isActive,
    },
  });

  // Update employee info
  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      position: data.position,
      bio: data.bio,
      experience: data.experience,
    },
  });

  revalidatePath('/admin/nhan-vien');
}

export async function toggleStaffActive(employeeId: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: true },
  });
  if (!employee) throw new Error('Employee not found');

  await prisma.user.update({
    where: { id: employee.userId },
    data: { isActive: !employee.user.isActive },
  });

  revalidatePath('/admin/nhan-vien');
}

export async function updateStaffSkills(employeeId: string, serviceIds: string[]) {
  // Delete existing skills
  await prisma.employeeSkill.deleteMany({ where: { employeeId } });
  // Create new skills
  if (serviceIds.length > 0) {
    await prisma.employeeSkill.createMany({
      data: serviceIds.map(serviceId => ({ employeeId, serviceId })),
    });
  }
  revalidatePath('/admin/nhan-vien');
}

export async function updateStaffSchedule(employeeId: string, schedules: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[]) {
  for (const schedule of schedules) {
    await prisma.workSchedule.upsert({
      where: { employeeId_dayOfWeek: { employeeId, dayOfWeek: schedule.dayOfWeek } },
      update: { startTime: schedule.startTime, endTime: schedule.endTime, isActive: schedule.isActive },
      create: { employeeId, dayOfWeek: schedule.dayOfWeek, startTime: schedule.startTime, endTime: schedule.endTime, isActive: schedule.isActive },
    });
  }
  revalidatePath('/admin/nhan-vien');
}

export async function deleteStaff(employeeId: string) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) throw new Error('Employee not found');
  await prisma.user.update({ where: { id: employee.userId }, data: { isActive: false } });
  revalidatePath('/admin/nhan-vien');
}
