'use client';

import { useEffect, useRef } from 'react';
import { isNative } from '@/lib/native';

/**
 * Polling component: kiểm tra booking mới mỗi 30 giây.
 * Khi có booking mới → hiện Local Notification trên iPhone (giống notification Zalo/Grab).
 * Không cần Apple Developer Account hay APNs.
 */
export default function AdminNotificationPoller() {
  const lastCountRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkNewBookings = async () => {
      try {
        const res = await fetch('/api/admin/notifications');
        if (!res.ok) return;

        const data = await res.json();
        const currentCount = data.count || 0;

        // Lần đầu: lưu count hiện tại, không thông báo
        if (lastCountRef.current === null) {
          lastCountRef.current = currentCount;
          return;
        }

        // Nếu có booking MỚI (count tăng)
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
              
              // Xin quyền nếu chưa có
              const perm = await LocalNotifications.requestPermissions();
              if (perm.display === 'granted') {
                await LocalNotifications.schedule({
                  notifications: [
                    {
                      id: Date.now(),
                      title: '📅 Lịch hẹn mới!',
                      body: `${customerName} đặt ${services} lúc ${time} ngày ${date}`,
                      schedule: { at: new Date(Date.now() + 1000) }, // 1 giây sau
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

          // Browser fallback: Web Notification API
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

    // Polling mỗi 30 giây
    intervalRef.current = setInterval(checkNewBookings, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return null; // Invisible component
}
