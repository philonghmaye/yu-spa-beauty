'use client';

import { useState } from 'react';
import { isNative, savePushToken } from '@/lib/native';
import { FiBell } from 'react-icons/fi';

export default function PushDebugButton() {
  const [loading, setLoading] = useState(false);

  const handleDebugPush = async () => {
    if (!isNative()) {
      alert('Chức năng này chỉ hoạt động trên Ứng dụng điện thoại (App Store / TestFlight). Trên trình duyệt web hoặc PWA không được hỗ trợ.');
      return;
    }

    try {
      setLoading(true);
      const { PushNotifications } = await import('@capacitor/push-notifications');
      
      const perm = await PushNotifications.requestPermissions();
      if (perm.receive !== 'granted') {
        alert('Lỗi: Bạn đã TỪ CHỐI cấp quyền thông báo cho ứng dụng này. Vui lòng vào Cài đặt máy -> Yuri Spa -> Thông báo -> Cho phép.');
        setLoading(false);
        return;
      }

      PushNotifications.addListener('registration', (token) => {
        savePushToken(token.value);
        alert('Đăng ký Push Token THÀNH CÔNG! Token: ' + token.value.substring(0, 15) + '...');
      });

      PushNotifications.addListener('registrationError', (error) => {
        alert('Lỗi đăng ký từ Apple APNs: ' + JSON.stringify(error));
      });

      await PushNotifications.register();
    } catch (e: any) {
      alert('Lỗi không xác định: ' + e.message);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  return (
    <button 
      onClick={handleDebugPush}
      disabled={loading}
      style={{
        width: '100%', padding: '12px', borderRadius: 10, background: '#fff', color: '#f59e0b',
        border: '1px solid #fde68a', fontWeight: 600, fontSize: '0.85rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        marginTop: '10px', cursor: 'pointer'
      }}
    >
      <FiBell /> {loading ? 'Đang kiểm tra...' : 'Chẩn đoán lỗi Thông Báo'}
    </button>
  );
}
