'use server';

import prisma from '@/lib/prisma';
import { getVietnamNow, getVietnamToday } from '@/lib/utils';
import { sendZaloReminder } from '@/lib/zalo';

export async function createNotification(data: {
  appointmentId?: string;
  type: string;
  channel: string;
  recipient: string;
  content: string;
  status?: string;
}) {
  return prisma.notification.create({
    data: {
      appointmentId: data.appointmentId || null,
      type: data.type,
      channel: data.channel,
      recipient: data.recipient,
      content: data.content,
      status: data.status || 'PENDING',
    },
  });
}

/**
 * Find appointments that need reminders (24h and 2h before)
 */
export async function getPendingReminders() {
  const now = getVietnamNow();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const tomorrow = `${in24h.getFullYear()}-${(in24h.getMonth() + 1).toString().padStart(2, '0')}-${in24h.getDate().toString().padStart(2, '0')}`;
  const todayDate = getVietnamToday();

  // Get appointments for 24h reminder
  const appointments24h = await prisma.appointment.findMany({
    where: {
      appointmentDate: tomorrow,
      status: { in: ['CONFIRMED'] },
      notifications: { none: { type: 'REMINDER_24H' } },
    },
    include: {
      customer: { include: { user: true } },
      services: { include: { service: true } },
    },
  });

  // Get appointments for 2h reminder (same day, upcoming)
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const twoHoursLater = `${in2h.getHours().toString().padStart(2, '0')}:${in2h.getMinutes().toString().padStart(2, '0')}`;

  const appointments2h = await prisma.appointment.findMany({
    where: {
      appointmentDate: todayDate,
      startTime: { gte: currentTime, lte: twoHoursLater },
      status: { in: ['CONFIRMED'] },
      notifications: { none: { type: 'REMINDER_2H' } },
    },
    include: {
      customer: { include: { user: true } },
      services: { include: { service: true } },
    },
  });

  return { appointments24h, appointments2h };
}

/**
 * Process and send all pending reminders
 */
export async function processReminders() {
  const { appointments24h, appointments2h } = await getPendingReminders();
  const results = { sent24h: 0, sent2h: 0, errors: 0 };

  // Send 24h reminders
  for (const apt of appointments24h) {
    const phone = apt.customer.user.phone;
    if (!phone) continue;

    try {
      const serviceName = apt.services.map((s) => s.service.name).join(', ');
      const result = await sendZaloReminder(
        phone,
        apt.customer.user.name,
        apt.appointmentDate,
        apt.startTime,
        serviceName,
        '24H'
      );

      await createNotification({
        appointmentId: apt.id,
        type: 'REMINDER_24H',
        channel: 'ZALO',
        recipient: phone,
        content: `Nhắc lịch 24h: ${apt.appointmentDate} ${apt.startTime}`,
        status: result.success ? 'SENT' : 'FAILED',
      });

      if (result.success) results.sent24h++;
      else results.errors++;
    } catch {
      results.errors++;
    }
  }

  // Send 2h reminders
  for (const apt of appointments2h) {
    const phone = apt.customer.user.phone;
    if (!phone) continue;

    try {
      const serviceName = apt.services.map((s) => s.service.name).join(', ');
      const result = await sendZaloReminder(
        phone,
        apt.customer.user.name,
        apt.appointmentDate,
        apt.startTime,
        serviceName,
        '2H'
      );

      await createNotification({
        appointmentId: apt.id,
        type: 'REMINDER_2H',
        channel: 'ZALO',
        recipient: phone,
        content: `Nhắc lịch 2h: ${apt.appointmentDate} ${apt.startTime}`,
        status: result.success ? 'SENT' : 'FAILED',
      });

      if (result.success) results.sent2h++;
      else results.errors++;
    } catch {
      results.errors++;
    }
  }

  return results;
}
