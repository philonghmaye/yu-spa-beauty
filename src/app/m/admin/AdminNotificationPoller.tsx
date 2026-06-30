'use client';

import { useEffect, useRef } from 'react';
import { isNative, retrySavePushToken } from '@/lib/native';

/**
 * Polling component: kiểm tra booking mới mỗi 30 giây.
 * - Hiện Local Notification trên iPhone khi có booking mới
 * - Cập nhật badge (số đỏ) trên icon app = tổng đơn chưa xác nhận
 */
export default function AdminNotificationPoller() {
  const lastCountRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cập nhật badge trên icon app
  const updateBadge = async (count: number) => {
    if (!isNative()) return;
    try {
      const { Badge } = await import('@capawesome/capacitor-badge');
      if (count > 0) {
        await Badge.set({ count });
      } else {
        await Badge.clear();
      }
    } catch (e) {
      console.error('Badge update failed:', e);
    }
  };

  useEffect(() => {
    retrySavePushToken();

    const checkNewBookings = async () => {
      try {
        // Lấy số đơn chờ xác nhận (PENDING) cho badge
        const [pendingRes, notiRes] = await Promise.all([
          fetch('/api/admin/pending-count'),
          fetch('/api/admin/notifications'),
        ]);

        // Cập nhật badge = số đơn chờ xác nhận
        if (pendingRes.ok) {
          const pendingData = await pendingRes.json();
          await updateBadge(pendingData.count || 0);
        }

        if (!notiRes.ok) return;
        const data = await notiRes.json();
        const currentCount = data.count || 0;

        // Lần đầu: lưu count hiện tại, không thông báo
        if (lastCountRef.current === null) {
          lastCountRef.current = currentCount;
          return;
        }

        // Nếu có booking MỚI (count tăng) → hiện notification
        if (currentCount > lastCountRef.current && data.notifications?.length > 0) {
          const newest = data.notifications[0];
          const customerName = newest.appointment?.customerName || 'Khách hàng';
          const services = newest.appointment?.services?.join(', ') || 'dịch vụ';
          const time = newest.appointment?.startTime || '';
          const date = newest.appointment?.appointmentDate || '';

          // Hiện Local Notification trên iPhone
          if (isNative()) {
            try {
              const { LocalNotifications } = await import('@capacitor/local-notifications');
              
              const perm = await LocalNotifications.requestPermissions();
              if (perm.display === 'granted') {
                await LocalNotifications.schedule({
                  notifications: [
                    {
                      id: Date.now(),
                      title: '📅 Lịch hẹn mới!',
                      body: `${customerName} đặt ${services} lúc ${time} ngày ${date}`,
                      schedule: { at: new Date(Date.now() + 1000) },
                      sound: 'default',
                      smallIcon: 'ic_stat_icon',
                      extra: {
                        appointmentId: newest.appointment?.id,
                      },
                    },
                  ],
                });
              }
            } catch (e) {
              console.error('Local notification failed:', e);
            }
          }

          // Browser fallback
          if (!isNative() && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification('📅 Lịch hẹn mới!', {
                body: `${customerName} đặt ${services} lúc ${time} ngày ${date}`,
                icon: '/icons/icon-192.png',
              });
            } else if (Notification.permission !== 'denied') {
              const perm = await Notification.requestPermission();
              if (perm === 'granted') {
                new Notification('📅 Lịch hẹn mới!', {
                  body: `${customerName} đặt ${services} lúc ${time} ngày ${date}`,
                  icon: '/icons/icon-192.png',
                });
              }
            }
          }
        }

        lastCountRef.current = currentCount;
      } catch {
        // Silently fail
      }
    };

    // Kiểm tra ngay lập tức
    checkNewBookings();

    // Polling mỗi 3 giây để thông báo tức thì
    intervalRef.current = setInterval(checkNewBookings, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return null; // Invisible component
}
