'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { addMinutesToTime, getVietnamNow } from '@/lib/utils';
import { sendBookingConfirmation } from '@/lib/email';

// ============ LOAD DATA FOR BOOKING FORM ============

export async function getBookingServices() {
  return prisma.service.findMany({
    where: { isActive: true },
    include: { category: { select: { id: true, name: true, slug: true, icon: true } } },
    orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
  });
}

export async function getBookingStaff() {
  return prisma.employee.findMany({
    where: { isAvailable: true, user: { isActive: true } },
    include: {
      user: { select: { name: true, avatar: true } },
      skills: { include: { service: { select: { id: true, name: true } } } },
      schedules: true,
    },
  });
}

// ============ SLOT AVAILABILITY ============

export async function getAvailableSlots(
  date: string,
  employeeId: string | null,
  totalDuration: number
) {
  // Generate all possible slots (09:00 - 18:30, 30min intervals)
  const allSlots = [];
  for (let h = 9; h <= 18; h++) {
    for (const m of [0, 30]) {
      if (h === 18 && m > 30) continue;
      const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      allSlots.push(time);
    }
  }

  // Get ALL existing appointments for this date
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      appointmentDate: date,
      status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
    },
    select: { startTime: true, endTime: true, employeeId: true },
  });

  // Get total employee count for "any" mode
  let totalEmployees = 0;
  if (!employeeId) {
    totalEmployees = await prisma.employee.count({
      where: { isAvailable: true, user: { isActive: true } },
    });
  }

  // Check each slot
  const slots = allSlots.map((time) => {
    const slotEnd = addMinutesToTime(time, totalDuration);
    
    // Check if slot end time exceeds business hours (19:00)
    if (slotEnd > '19:00') {
      return { time, available: false };
    }

    if (employeeId) {
      // SPECIFIC EMPLOYEE: check if this employee has a conflict
      const hasConflict = existingAppointments.some((apt) => {
        return apt.employeeId === employeeId && time < apt.endTime && slotEnd > apt.startTime;
      });
      return { time, available: !hasConflict };
    } else {
      // ANY EMPLOYEE: available if at least 1 employee is free
      const busyEmployeeIds = new Set<string>();
      existingAppointments.forEach((apt) => {
        if (apt.employeeId && time < apt.endTime && slotEnd > apt.startTime) {
          busyEmployeeIds.add(apt.employeeId);
        }
      });
      return { time, available: busyEmployeeIds.size < totalEmployees };
    }
  });

  return slots;
}

// ============ CREATE BOOKING ============

export async function createBooking(data: {
  serviceIds: string[];
  employeeId: string | null;
  appointmentDate: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerNote?: string;
  promoCode?: string;
  userId?: string; // if logged in
}) {
  // 1. Get selected services
  const services = await prisma.service.findMany({
    where: { id: { in: data.serviceIds }, isActive: true },
  });

  if (services.length === 0) {
    throw new Error('Vui lòng chọn ít nhất 1 dịch vụ');
  }

  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
  const totalAmount = services.reduce((sum, s) => sum + (s.discountPrice || s.price), 0);
  const endTime = addMinutesToTime(data.startTime, totalDuration);

  // 2. Verify slot is still available
  const slots = await getAvailableSlots(data.appointmentDate, data.employeeId, totalDuration);
  const selectedSlot = slots.find((s) => s.time === data.startTime);
  if (!selectedSlot || !selectedSlot.available) {
    throw new Error('Khung giờ này đã được đặt. Vui lòng chọn giờ khác.');
  }

  // 2b. Auto-assign a free employee when "any" is selected
  let assignedEmployeeId = data.employeeId;
  if (!assignedEmployeeId) {
    // Get all available employees
    const allEmployees = await prisma.employee.findMany({
      where: { isAvailable: true, user: { isActive: true } },
      select: { id: true },
    });

    // Get appointments at this time slot
    const conflictingApts = await prisma.appointment.findMany({
      where: {
        appointmentDate: data.appointmentDate,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
      select: { startTime: true, endTime: true, employeeId: true },
    });

    // Find first employee with no conflict
    const busyEmployeeIds = new Set<string>();
    conflictingApts.forEach((apt) => {
      if (apt.employeeId && data.startTime < apt.endTime && endTime > apt.startTime) {
        busyEmployeeIds.add(apt.employeeId);
      }
    });

    const freeEmployee = allEmployees.find((e) => !busyEmployeeIds.has(e.id));
    if (freeEmployee) {
      assignedEmployeeId = freeEmployee.id;
    }
    // If no free employee found, leave null (shouldn't happen since slot was available)
  }

  // 3. Apply promo code if provided
  let discountAmount = 0;
  let promotionId: string | null = null;

  if (data.promoCode) {
    const promo = await prisma.promotion.findUnique({
      where: { code: data.promoCode.toUpperCase() },
    });

    if (!promo || !promo.isActive) {
      throw new Error('Mã giảm giá không hợp lệ');
    }

    const now = getVietnamNow();
    if (now < promo.startDate || now > promo.endDate) {
      throw new Error('Mã giảm giá đã hết hạn');
    }

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      throw new Error('Mã giảm giá đã hết lượt sử dụng');
    }

    if (promo.minOrderValue && totalAmount < promo.minOrderValue) {
      throw new Error(`Đơn tối thiểu ${promo.minOrderValue.toLocaleString('vi-VN')}₫ để áp dụng mã này`);
    }

    if (promo.type === 'PERCENTAGE') {
      discountAmount = totalAmount * (promo.value / 100);
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    } else {
      discountAmount = promo.value;
    }

    promotionId = promo.id;

    // Increment usage count
    await prisma.promotion.update({
      where: { id: promo.id },
      data: { usedCount: { increment: 1 } },
    });
  }

  const finalAmount = Math.max(0, totalAmount - discountAmount);

  // 4. Find or create customer
  let customerId: string;

  if (data.userId) {
    // Logged in user
    const customer = await prisma.customer.findFirst({
      where: { userId: data.userId },
    });
    if (customer) {
      customerId = customer.id;
    } else {
      const newCustomer = await prisma.customer.create({
        data: { userId: data.userId },
      });
      customerId = newCustomer.id;
    }
  } else {
    // Guest user - find by phone or create
    const existingUser = await prisma.user.findFirst({
      where: { phone: data.customerPhone },
      include: { customer: true },
    });

    if (existingUser && existingUser.customer) {
      customerId = existingUser.customer.id;
    } else {
      const { default: bcrypt } = await import('bcryptjs');
      const tempPassword = await bcrypt.hash(data.customerPhone, 10);
      const newUser = await prisma.user.create({
        data: {
          name: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail || null,
          password: tempPassword,
          role: 'CUSTOMER',
          customer: { create: {} },
        },
        include: { customer: true },
      });
      customerId = newUser.customer!.id;
    }
  }

  // 5. Create appointment
  const appointment = await prisma.appointment.create({
    data: {
      customerId,
      employeeId: assignedEmployeeId || null,
      promotionId,
      appointmentDate: data.appointmentDate,
      startTime: data.startTime,
      endTime,
      status: 'PENDING',
      customerNote: data.customerNote || null,
      totalAmount,
      discountAmount,
      finalAmount,
      services: {
        create: services.map((s) => ({
          serviceId: s.id,
          price: s.discountPrice || s.price,
          duration: s.duration,
        })),
      },
    },
    include: {
      customer: { include: { user: true } },
      employee: { include: { user: true } },
      services: { include: { service: true } },
      promotion: true,
    },
  });

  // 6. Create notification record & send email
  try {
    const recipientEmail = data.customerEmail || appointment.customer.user.email;
    if (recipientEmail) {
      await sendBookingConfirmation(appointment);
      await prisma.notification.create({
        data: {
          appointmentId: appointment.id,
          type: 'BOOKING_CONFIRMED',
          channel: 'EMAIL',
          recipient: recipientEmail,
          content: `Xác nhận đặt lịch #${appointment.id.slice(-6)}`,
          status: 'SENT',
          sentAt: new Date(),
        },
      });
    }
  } catch (err) {
    console.error('Failed to send email:', err);
    // Don't fail the booking if email fails
  }

  // 7. Revalidate paths
  revalidatePath('/admin');
  revalidatePath('/admin/lich-hen');
  revalidatePath('/dat-lich');

  return {
    id: appointment.id,
    appointmentDate: appointment.appointmentDate,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    services: appointment.services.map((s) => s.service.name),
    employeeName: appointment.employee?.user.name || null,
    totalAmount,
    discountAmount,
    finalAmount,
    promoCode: data.promoCode || null,
  };
}

// ============ VALIDATE PROMO CODE ============

export async function validatePromoCode(code: string, totalAmount: number) {
  const promo = await prisma.promotion.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!promo || !promo.isActive) {
    return { valid: false, error: 'Mã giảm giá không hợp lệ' };
  }

  const now = getVietnamNow();
  if (now < promo.startDate || now > promo.endDate) {
    return { valid: false, error: 'Mã giảm giá đã hết hạn' };
  }

  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    return { valid: false, error: 'Mã giảm giá đã hết lượt sử dụng' };
  }

  if (promo.minOrderValue && totalAmount < promo.minOrderValue) {
    return { valid: false, error: `Đơn tối thiểu ${promo.minOrderValue.toLocaleString('vi-VN')}₫` };
  }

  let discountAmount = 0;
  if (promo.type === 'PERCENTAGE') {
    discountAmount = totalAmount * (promo.value / 100);
    if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
      discountAmount = promo.maxDiscount;
    }
  } else {
    discountAmount = Math.min(promo.value, totalAmount);
  }

  return {
    valid: true,
    discountAmount,
    promoName: promo.name,
    promoType: promo.type,
    promoValue: promo.value,
  };
}
