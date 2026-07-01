'use client';

import { useState } from 'react';
import { isNative, retrySavePushToken } from '@/lib/native';
import { FiBell } from 'react-icons/fi';

export default function PushDebugButton() {
  const [loading, setLoading] = useState(false);

  const handleDebugPush = async () => {
    if (!isNative()) {
      alert('Chỉ hoạt động trên App iOS (TestFlight/App Store).');
      return;
    }

    try {
      setLoading(true);

      const cachedToken = localStorage.getItem('cached_push_token');
      const nativeError = localStorage.getItem('apns_native_error');
      
      if (cachedToken) {
        // CÓ TOKEN → gửi lên server và test
        await retrySavePushToken();
        const testRes = await fetch('/api/admin/test-push', { method: 'POST' });
        const testData = await testRes.json().catch(() => ({}));
        
        alert([
          '✅ TOKEN ĐÃ CÓ!',
          `Token: ${cachedToken.substring(0, 20)}...`,
          '',
          `Test push: ${testData.sent ? '✅ Đã gửi!' : '❌ ' + (testData.error || 'Lỗi')}`,
          testData.sent ? 'Bạn sẽ nhận được thông báo ngay!' : '',
        ].join('\n'));
      } else if (nativeError) {
        // Native gửi lỗi
        alert([
          '❌ APPLE TỪ CHỐI CẤP TOKEN',
          '',
          `Lỗi từ Apple: ${nativeError}`,
          '',
          'Nguyên nhân thường gặp:',
          '1. Push chưa bật trong Apple Developer Portal',
          '2. Provisioning Profile chưa đúng',
          '3. Entitlements không khớp',
        ].join('\n'));
      } else {
        // Kiểm tra server xem token đã được gửi trực tiếp chưa
        try {
          const checkRes = await fetch('/api/admin/check-push-tokens');
          const checkData = await checkRes.json().catch(() => ({}));
          
          if (checkData.tokens && checkData.tokens > 0) {
            alert([
              '✅ TOKEN ĐÃ ĐƯỢC GỬI TRỰC TIẾP TỪ NATIVE!',
              '',
              `Số token trên server: ${checkData.tokens}`,
              '',
              'Token chưa lưu vào localStorage nhưng server ĐÃ CÓ.',
              'Push notification sẽ hoạt động bình thường!',
            ].join('\n'));
          } else {
            alert([
              '❌ CHƯA CÓ TOKEN',
              '',
              'Không có trong localStorage.',
              'Không có lỗi từ Apple.',
              'Không có trên server.',
              '',
              'Có thể do:',
              '1. App chưa được cập nhật mới nhất từ TestFlight',
              '2. Cần XÓA app và CÀI LẠI từ TestFlight',
              '3. iOS chặn push (Cài đặt → Thông báo → Yuri Spa)',
            ].join('\n'));
          }
        } catch {
          alert('❌ CHƯA CÓ TOKEN\n\nKhông kiểm tra được server.\nThử tắt app và mở lại.');
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
      <FiBell /> {loading ? 'Đang kiểm tra...' : 'Chẩn đoán Thông Báo'}
    </button>
  );
}
