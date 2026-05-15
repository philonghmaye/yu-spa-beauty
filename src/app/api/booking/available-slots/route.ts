import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { addMinutesToTime, getVietnamNow, getVietnamToday, generateSlotTimes } from '@/lib/utils';
import { getBusinessHours } from '@/actions/settings';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');
  const employeeId = searchParams.get('employeeId');
  const duration = parseInt(searchParams.get('duration') || '60', 10);

  if (!date) {
    return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
  }

  // Get business hours from store settings
  const { openTime, closeTime, slotInterval } = await getBusinessHours();

  // Generate all possible slots based on business hours
  const allSlots = generateSlotTimes(openTime, closeTime, slotInterval);

  // Get ALL existing appointments for this date (active statuses)
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      appointmentDate: date,
      status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
    },
    select: { startTime: true, endTime: true, employeeId: true },
  });

  // If "any" staff → get total available employees to check if at least 1 is free
  let totalEmployees = 0;
  if (!employeeId || employeeId === 'any') {
    totalEmployees = await prisma.employee.count({
      where: { isAvailable: true, user: { isActive: true } },
    });
  }

  // Check availability for each slot
  const slots = allSlots.map((time) => {
    const slotEnd = addMinutesToTime(time, duration);

    // Exceeds business closing time
    if (slotEnd > closeTime) {
      return { time, available: false };
    }

    // Check for today: don't show past time slots (using Vietnam timezone)
    const today = getVietnamToday();
    if (date === today) {
      const now = getVietnamNow();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (time <= currentTime) {
        return { time, available: false };
      }
    }

    if (employeeId && employeeId !== 'any') {
      // === SPECIFIC EMPLOYEE: check if THIS employee has a conflict ===
      const hasConflict = existingAppointments.some((apt) => {
        return apt.employeeId === employeeId && time < apt.endTime && slotEnd > apt.startTime;
      });
      return { time, available: !hasConflict };
    } else {
      // === ANY EMPLOYEE: slot available if at least 1 employee is free ===
      const busyEmployeeIds = new Set<string>();
      existingAppointments.forEach((apt) => {
        if (apt.employeeId && time < apt.endTime && slotEnd > apt.startTime) {
          busyEmployeeIds.add(apt.employeeId);
        }
      });
      const available = busyEmployeeIds.size < totalEmployees;
      return { time, available };
    }
  });

  return NextResponse.json({ slots, businessHours: { openTime, closeTime } });
}
