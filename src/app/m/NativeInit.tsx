'use client';
 
import { useEffect, useState } from 'react';
import { FiWifiOff } from 'react-icons/fi';
import {
  initPushNotifications,
  setupStatusBar,
  setupAppListeners,
  hideSplash,
  isNative,
} from '@/lib/native';
 
/**
 * Component khởi tạo tất cả tính năng native và quản lý kết nối mạng
 * Đặt trong layout mobile để tự động chạy khi app load
 */
export default function NativeInit() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Chỉ chạy ở phía client
    if (typeof window !== 'undefined') {
      setIsOffline(!window.navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Đăng ký Service Worker để cache assets trên điện thoại
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

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
 
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      const online = window.navigator.onLine;
      setIsOffline(!online);
      if (online) {
        window.location.reload();
      }
    }
  };

  if (isOffline) {
    return (
      <div className="m-offline-overlay">
        <div className="m-offline-content">
          <div className="m-offline-icon">
            <FiWifiOff />
          </div>
          <h3 className="m-offline-title">Mất kết nối mạng</h3>
          <p className="m-offline-text">
            Vui lòng kiểm tra kết nối Wi-Fi hoặc dữ liệu di động của bạn để tiếp tục sử dụng Yuri Spa Beauty.
          </p>
          <button className="m-offline-btn" onClick={handleRetry}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return null; // Invisible component when online
}
