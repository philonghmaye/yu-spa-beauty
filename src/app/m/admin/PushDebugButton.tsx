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
      const cachedToken = localStorage.getItem('cached_push_token');
      
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const perm = await PushNotifications.checkPermissions();
      
      alert('Tình trạng hiện tại:\\nQuyền: ' + perm.receive + '\\nToken đã lưu máy: ' + (cachedToken ? cachedToken.substring(0, 15) + '...' : 'KHÔNG CÓ'));

      if (cachedToken) {
         savePushToken(cachedToken);
         alert('Đã thử gửi lại token lên Server!');
      } else {
         const newPerm = await PushNotifications.requestPermissions();
         if (newPerm.receive === 'granted') {
             alert('Đang yêu cầu Apple cấp Token mới...');
             PushNotifications.addListener('registration', (token) => {
                alert('Apple đã cấp Token: ' + token.value.substring(0, 15) + '...');
                savePushToken(token.value);
             });
             PushNotifications.addListener('registrationError', (error) => {
                alert('Apple từ chối cấp Token: ' + JSON.stringify(error));
             });
             await PushNotifications.register();
         }
      }
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
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
