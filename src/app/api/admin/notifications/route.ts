import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/notifications
 * Returns unread admin notifications (new bookings)
 */
export async function GET(request: NextRequest) {
  // Auth check: only ADMIN
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        type: 'ADMIN_NEW_BOOKING',
        status: 'PENDING', // unread
      },
      include: {
        appointment: {
          include: {
            customer: { include: { user: { select: { name: true, phone: true } } } },
            services: { include: { service: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      count: notifications.length,
      notifications: notifications.map((n) => ({
        id: n.id,
        createdAt: n.createdAt.toISOString(),
        appointment: n.appointment
          ? {
              id: n.appointment.id,
              customerName: n.appointment.customer.user.name,
              customerPhone: n.appointment.customer.user.phone,
              services: n.appointment.services.map((s) => s.service.name),
              appointmentDate: n.appointment.appointmentDate,
              startTime: n.appointment.startTime,
              endTime: n.appointment.endTime,
              finalAmount: n.appointment.finalAmount,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch admin notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/notifications
 * Mark all admin notifications as read (delete them)
 */
export async function POST(request: NextRequest) {
  // Auth check: only ADMIN
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.notification.deleteMany({
      where: {
        type: 'ADMIN_NEW_BOOKING',
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to clear admin notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
