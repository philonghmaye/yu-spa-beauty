'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAppointments(filters?: {
  status?: string; date?: string; employeeId?: string;
}) {
  const where: Record<string, unknown> = {};
  if (filters?.status && filters.status !== 'ALL') where.status = filters.status;
  if (filters?.date) where.appointmentDate = filters.date;
  if (filters?.employeeId) where.employeeId = filters.employeeId;

  return prisma.appointment.findMany({
    where,
    include: {
      customer: { include: { user: { select: { name: true, phone: true, email: true } } } },
      employee: { include: { user: { select: { name: true } } } },
      services: { include: { service: { select: { name: true, price: true, duration: true } } } },
    },
    orderBy: [{ appointmentDate: 'desc' }, { startTime: 'asc' }],
  });
}

export async function getAppointmentById(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      customer: { include: { user: true } },
      employee: { include: { user: true } },
      services: { include: { service: true } },
      review: true,
    },
  });
}

export async function updateAppointmentStatus(id: string, status: string) {
  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status },
    include: { customer: { include: { user: true } } },
  });

  // If completed, update customer stats
  if (status === 'COMPLETED') {
    await prisma.customer.update({
      where: { id: appointment.customerId },
      data: {
        totalVisits: { increment: 1 },
        totalSpent: { increment: appointment.finalAmount },
      },
    });
  }

  // Send email notification
  try {
    const { sendStatusUpdateEmail } = await import('@/lib/email');
    const email = appointment.customer.user.email;
    if (email) {
      await sendStatusUpdateEmail(
        email,
        appointment.customer.user.name,
        appointment.id.slice(-6).toUpperCase(),
        status,
        appointment.appointmentDate,
        appointment.startTime,
      );
    }
  } catch (err) {
    console.error('Failed to send status email:', err);
  }

  revalidatePath('/admin/lich-hen');
  revalidatePath('/admin');
  return appointment;
}

export async function addStaffNote(id: string, note: string) {
  await prisma.appointment.update({
    where: { id },
    data: { staffNote: note },
  });
  revalidatePath('/admin/lich-hen');
}

export async function createAppointmentAdmin(data: {
  customerId: string; employeeId?: string; appointmentDate: string;
  startTime: string; endTime: string; serviceIds: string[];
  customerNote?: string; staffNote?: string;
}) {
  // Get services for price calc
  const services = await prisma.service.findMany({
    where: { id: { in: data.serviceIds } },
  });

  const totalAmount = services.reduce((sum, s) => sum + s.price, 0);

  const appointment = await prisma.appointment.create({
    data: {
      customerId: data.customerId,
      employeeId: data.employeeId || null,
      appointmentDate: data.appointmentDate,
      startTime: data.startTime,
      endTime: data.endTime,
      customerNote: data.customerNote || null,
      staffNote: data.staffNote || null,
      totalAmount,
      finalAmount: totalAmount,
      status: 'CONFIRMED',
      services: {
        create: services.map(s => ({
          serviceId: s.id,
          price: s.price,
          duration: s.duration,
        })),
      },
    },
  });

  revalidatePath('/admin/lich-hen');
  revalidatePath('/admin');
  return appointment;
}

export async function deleteAppointment(id: string) {
  await prisma.appointment.delete({ where: { id } });
  revalidatePath('/admin/lich-hen');
  revalidatePath('/admin');
}
