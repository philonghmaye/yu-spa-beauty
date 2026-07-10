'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy load AdminNotificationPoller
const AdminNotificationPoller = dynamic(() => import('./admin/AdminNotificationPoller'), {
  ssr: false,
});

/**
 * Client-side wrapper: chỉ render AdminNotificationPoller nếu user là ADMIN.
 * Trước đây: Server Component gọi auth() mỗi lần navigate → DB query cho MỌI user.
 * Giờ: Client check session cache → không tốn DB query.
 */
export default function GlobalAdminPollerWrapper() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check từ sessionStorage cache trước (instant)
    try {
      const cached = sessionStorage.getItem('is_admin');
      if (cached === 'true') {
        setIsAdmin(true);
        return;
      }
    } catch {}

    // Fallback: check session API
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(sess => {
        const admin = sess?.user?.role === 'ADMIN';
        setIsAdmin(admin);
        try {
          sessionStorage.setItem('is_admin', admin ? 'true' : 'false');
        } catch {}
      })
      .catch(() => {});
  }, []);

  if (!isAdmin) return null;
  return <AdminNotificationPoller />;
}
