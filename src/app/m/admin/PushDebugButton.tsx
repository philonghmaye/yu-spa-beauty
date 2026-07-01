'use client';

import { useState } from 'react';
import { isNative, retrySavePushToken } from '@/lib/native';
import { FiBell } from 'react-icons/fi';

export default function PushDebugButton() {
  const [loading, setLoading] = useState(false);

  const handleDebugPush = async () => {
    if (!isNative()) {
      alert('Chức năng này chỉ hoạt động trên App iOS. Trình duyệt web không hỗ trợ.');
      return;
    }

    try {
      setLoading(true);

      // Kiểm tra token trong localStorage (có thể được inject bởi native Swift)
      const cachedToken = typeof window !== 'undefined' ? localStorage.getItem('cached_push_token') : null;
      
      if (cachedToken) {
        // ĐÃ CÓ TOKEN! Gửi lên server
        alert(`✅ ĐÃ CÓ TOKEN!\n\nToken: ${cachedToken.substring(0, 20)}...\n\nĐang gửi lên server và test push...`);
        
        await retrySavePushToken();
        
        // Gửi test push
        const testRes = await fetch('/api/admin/test-push', { method: 'POST' });
        const testData = await testRes.json().catch(() => ({}));
        
        alert([
          '🔔 KẾT QUẢ TEST PUSH:',
          '',
          `Gửi lên server: ✅`,
          `Test push: ${testData.sent ? '✅ Đã gửi! Chờ thông báo...' : '❌ Lỗi: ' + (testData.error || 'Unknown')}`,
        ].join('\n'));
      } else {
        // CHƯA CÓ TOKEN
        // Thử đăng ký qua Capacitor plugin
        try {
          const { PushNotifications } = await import('@capacitor/push-notifications');
          const perm = await PushNotifications.checkPermissions();
          
          // Hiển thị trạng thái chi tiết
          alert([
            '❌ CHƯA CÓ TOKEN',
            '',
            `Quyền iOS: ${perm.receive}`,
            `localStorage: KHÔNG CÓ`,
            '',
            'Đang thử đăng ký lại...',
            'Nếu vẫn không được, thử:',
            '1. Tắt app hoàn toàn (vuốt lên)',
            '2. Mở lại app, đợi 5 giây',
            '3. Bấm nút này lại',
          ].join('\n'));

          if (perm.receive !== 'granted') {
            await PushNotifications.requestPermissions();
          }
          
          // Xóa listener cũ và gắn mới
          await PushNotifications.removeAllListeners();
          
          // Đợi 5 giây để xem native inject có hoạt động không
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Kiểm tra lại localStorage
          const retryToken = localStorage.getItem('cached_push_token');
          if (retryToken) {
            alert(`✅ THÀNH CÔNG! Token được inject bởi native!\n\nToken: ${retryToken.substring(0, 20)}...`);
            await retrySavePushToken();
          } else {
            alert([
              '❌ VẪN KHÔNG CÓ TOKEN',
              '',
              'Nguyên nhân có thể:',
              '1. Chưa cập nhật app mới từ TestFlight',
              '2. Cần tắt app hoàn toàn rồi mở lại',
              '3. Provisioning Profile chưa đúng',
            ].join('\n'));
          }
        } catch (pluginErr: any) {
          alert('Lỗi plugin: ' + pluginErr.message);
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
