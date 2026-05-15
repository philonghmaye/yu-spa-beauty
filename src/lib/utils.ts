import { format, parse, addMinutes, isAfter, isBefore, isEqual } from 'date-fns';
import { vi } from 'date-fns/locale';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatDate(date: string | Date, fmt: string = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, fmt, { locale: vi });
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];
  let current = parse(startTime, 'HH:mm', new Date());
  const end = parse(endTime, 'HH:mm', new Date());

  while (isBefore(current, end) || isEqual(current, end)) {
    slots.push(format(current, 'HH:mm'));
    current = addMinutes(current, intervalMinutes);
  }
  return slots;
}

export function isSlotAvailable(
  slotStart: string,
  slotDuration: number,
  bookedSlots: { startTime: string; endTime: string }[]
): boolean {
  const slotStartTime = parse(slotStart, 'HH:mm', new Date());
  const slotEndTime = addMinutes(slotStartTime, slotDuration);

  return !bookedSlots.some((booked) => {
    const bookedStart = parse(booked.startTime, 'HH:mm', new Date());
    const bookedEnd = parse(booked.endTime, 'HH:mm', new Date());
    return isBefore(slotStartTime, bookedEnd) && isAfter(slotEndTime, bookedStart);
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    IN_PROGRESS: 'Đang thực hiện',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    NO_SHOW: 'Không đến',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'warning',
    CONFIRMED: 'primary',
    IN_PROGRESS: 'accent',
    COMPLETED: 'success',
    CANCELLED: 'error',
    NO_SHOW: 'error',
  };
  return colors[status] || 'primary';
}

export function addMinutesToTime(time: string, minutes: number): string {
  const t = parse(time, 'HH:mm', new Date());
  return format(addMinutes(t, minutes), 'HH:mm');
}
