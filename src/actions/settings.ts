'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Default business hours
const DEFAULT_OPEN_TIME = '09:00';
const DEFAULT_CLOSE_TIME = '19:00';
const DEFAULT_SLOT_INTERVAL = '30'; // minutes

export interface BusinessHours {
  openTime: string;   // "08:00"
  closeTime: string;  // "20:00"
  slotInterval: number; // 30
}

/**
 * Get business hours from StoreSetting
 */
export async function getBusinessHours(): Promise<BusinessHours> {
  try {
    const settings = await prisma.storeSetting.findMany({
      where: { key: { in: ['OPEN_TIME', 'CLOSE_TIME', 'SLOT_INTERVAL'] } },
    });

    const map = new Map(settings.map((s) => [s.key, s.value]));

    return {
      openTime: map.get('OPEN_TIME') || DEFAULT_OPEN_TIME,
      closeTime: map.get('CLOSE_TIME') || DEFAULT_CLOSE_TIME,
      slotInterval: parseInt(map.get('SLOT_INTERVAL') || DEFAULT_SLOT_INTERVAL, 10),
    };
  } catch {
    return {
      openTime: DEFAULT_OPEN_TIME,
      closeTime: DEFAULT_CLOSE_TIME,
      slotInterval: parseInt(DEFAULT_SLOT_INTERVAL, 10),
    };
  }
}

import { requireAdmin } from '@/lib/auth-guard';

/**
 * Update business hours in StoreSetting
 */
export async function updateBusinessHours(data: {
  openTime: string;
  closeTime: string;
  slotInterval: number;
}) {
  await requireAdmin();
  const entries = [
    { key: 'OPEN_TIME', value: data.openTime },
    { key: 'CLOSE_TIME', value: data.closeTime },
    { key: 'SLOT_INTERVAL', value: data.slotInterval.toString() },
  ];

  for (const entry of entries) {
    await prisma.storeSetting.upsert({
      where: { key: entry.key },
      update: { value: entry.value },
      create: { key: entry.key, value: entry.value },
    });
  }

  revalidatePath('/admin');
  revalidatePath('/admin/cai-dat');
  revalidatePath('/dat-lich');

  return { success: true };
}
