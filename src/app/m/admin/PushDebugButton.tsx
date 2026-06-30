'use client';

import { useState } from 'react';
import { isNative, savePushToken } from '@/lib/native';
import { FiBell } from 'react-icons/fi';

export default function PushDebugButton() {
  const [loading, setLoading] = useState(false);

  const handleDebugPush = async () => {
    if (!isNative()) {
      alert('Ch?c nang này ch? ho?t d?ng trên ?ng d?ng di?n tho?i (App Store / TestFlight). Trên trình duy?t web ho?c PWA không du?c h? tr?.');
      return;
    }

    try {
      setLoading(true);
      const { PushNotifications } = await import('@capacitor/push-notifications');
      
      const perm = await PushNotifications.requestPermissions();
      if (perm.receive !== 'granted') {
        alert('L?i: B?n dã T? CH?I c?p quy?n thông báo cho ?ng d?ng này. Vui lòng vào Cài d?t máy -> Yuri Spa -> Thông báo -> Cho phép.');
        setLoading(false);
        return;
      }

      PushNotifications.addListener('registration', (token) => {
        savePushToken(token.value);
        alert('Ðang ký Push Token THÀNH CÔNG! Token: ' + token.value.substring(0, 15) + '...');
      });

      PushNotifications.addListener('registrationError', (error) => {
        alert('L?i dang ký t? Apple APNs: ' + JSON.stringify(error));
      });

      await PushNotifications.register();
    } catch (e: any) {
      alert('L?i không xác d?nh: ' + e.message);
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
      <FiBell /> {loading ? 'Ðang ki?m tra...' : 'Ch?n doán l?i Thông Báo'}
    </button>
  );
}
