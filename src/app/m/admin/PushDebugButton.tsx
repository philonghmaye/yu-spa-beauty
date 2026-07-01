'use client';

import { useState } from 'react';
import { isNative, reRegisterPush, retrySavePushToken } from '@/lib/native';
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

      // Bước 1: Hiển thị trạng thái hiện tại
      const cachedToken = typeof window !== 'undefined' ? localStorage.getItem('cached_push_token') : null;
      
      const statusMsg = [
        '📱 TRẠNG THÁI HIỆN TẠI:',
        `Token đã lưu: ${cachedToken ? '✅ CÓ (' + cachedToken.substring(0, 15) + '...)' : '❌ KHÔNG CÓ'}`,
        '',
        'Bấm OK để thử đăng ký lại với Apple...',
      ].join('\n');
      alert(statusMsg);

      // Bước 2: Nếu đã có token, thử gửi lên server trước
      if (cachedToken) {
        await retrySavePushToken();
        
        // Gửi test push
        const testRes = await fetch('/api/admin/test-push', { method: 'POST' });
        const testData = await testRes.json().catch(() => ({}));
        
        alert([
          '🔔 KẾT QUẢ:',
          `Token: ✅ Có sẵn`,
          `Gửi lên server: ✅ Đã gửi`,
          `Test push: ${testData.sent ? '✅ Đã gửi ' + testData.sent + ' thiết bị' : '❌ ' + (testData.error || 'Lỗi')}`,
          '',
          testData.sent ? 'Bạn sẽ nhận được thông báo test ngay bây giờ!' : 'Kiểm tra lại cấu hình APNs trên Vercel.',
        ].join('\n'));
        return;
      }

      // Bước 3: Không có token → đăng ký mới
      const result = await reRegisterPush();

      if (result.token) {
        // Thành công! Gửi test push luôn
        const testRes = await fetch('/api/admin/test-push', { method: 'POST' });
        const testData = await testRes.json().catch(() => ({}));
        
        alert([
          '🎉 THÀNH CÔNG!',
          `Token mới: ${result.token.substring(0, 15)}...`,
          `Test push: ${testData.sent ? '✅ Đã gửi' : '❌ Lỗi'}`,
          '',
          testData.sent ? 'Bạn sẽ nhận được thông báo test!' : 'Token OK nhưng server chưa gửi được.',
        ].join('\n'));
      } else {
        alert([
          '❌ KHÔNG NHẬN ĐƯỢC TOKEN',
          '',
          `Lỗi: ${result.error || 'Apple không phản hồi'}`,
          '',
          'Nguyên nhân có thể:',
          '1. App chưa có Push Notification Capability',
          '2. Provisioning Profile chưa bật Push',
          '3. Cần cài lại app từ TestFlight',
        ].join('\n'));
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
