'use client';

import { useEffect } from 'react';
import {
  initPushNotifications,
  setupStatusBar,
  setupAppListeners,
  hideSplash,
  isNative,
} from '@/lib/native';

/**
 * Component khởi tạo tất cả tính năng native
 * Đặt trong layout mobile để tự động chạy khi app load
 */
export default function NativeInit() {
  useEffect(() => {
    if (!isNative()) return;

    const init = async () => {
      try {
        // Setup status bar (iOS)
        await setupStatusBar();

        // Setup push notifications
        await initPushNotifications();

        // Setup app lifecycle listeners
        await setupAppListeners();

        // Hide splash screen sau khi app ready
        await hideSplash();

        console.log('✅ Native features initialized');
      } catch (e) {
        console.error('Native init error:', e);
      }
    };

    init();
  }, []);

  return null; // Invisible component
}
