import { format, parse, addMinutes, isAfter, isBefore, isEqual } from 'date-fns';
import { vi } from 'date-fns/locale';

// Vietnam timezone offset: UTC+7
const VIETNAM_TZ = 'Asia/Ho_Chi_Minh';

/**
 * Returns current Date object adjusted to Vietnam timezone (UTC+7).
 * On Vercel (UTC server), new Date() returns UTC time which is 7 hours behind Vietnam.
 * This function ensures consistent timezone behavior across all environments.
 */
export function getVietnamNow(): Date {
  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: VIETNAM_TZ }));
  return vietnamTime;
}

/**
 * Returns today's date string in Vietnam timezone (YYYY-MM-DD format).
 */
export function getVietnamToday(): string {
  const vn = getVietnamNow();
  const y = vn.getFullYear();
  const m = (vn.getMonth() + 1).toString().padStart(2, '0');
  const d = vn.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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

/**
 * Generate time slot strings based on business hours
 */
export function generateSlotTimes(openTime: string, closeTime: string, interval: number): string[] {
  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const slots: string[] = [];
  for (let t = openMinutes; t < closeMinutes; t += interval) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  }
  return slots;
}
