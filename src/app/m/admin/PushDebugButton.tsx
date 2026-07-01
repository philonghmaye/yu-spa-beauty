'use client';

import { useState } from 'react';
import { isNative } from '@/lib/native';
import { FiBell } from 'react-icons/fi';

export default function PushDebugButton() {
  const [loading, setLoading] = useState(false);

  const handleDebugPush = async () => {
    try {
      setLoading(true);

      // Kiểm tra token local
      const cachedToken = typeof window !== 'undefined' ? localStorage.getItem('cached_push_token') : null;
      const nativeError = typeof window !== 'undefined' ? localStorage.getItem('apns_native_error') : null;
      
      // Đọc log từ server
      let serverLogs = '';
      try {
        const logRes = await fetch('/api/push-debug-log');
        const logData = await logRes.json();
        if (logData.logs && logData.logs.length > 0) {
          serverLogs = logData.logs.map((l: any) => 
            `${new Date(l.createdAt).toLocaleTimeString('vi-VN')}: ${l.content}`
          ).join('\n');
        } else {
          serverLogs = '(Không có log nào - Native chưa gọi server)';
        }
      } catch {
        serverLogs = '(Lỗi đọc log server)';
      }

      // Kiểm tra token trên server
      let serverTokens = 0;
      try {
        const checkRes = await fetch('/api/admin/check-push-tokens');
        const checkData = await checkRes.json();
        serverTokens = checkData.tokens || 0;
      } catch {}

      const status = [
        '📱 CHẨN ĐOÁN PUSH NOTIFICATION',
        `Chạy trên native: ${isNative() ? '✅' : '❌'}`,
        `Token localStorage: ${cachedToken ? '✅ ' + cachedToken.substring(0, 15) + '...' : '❌'}`,
        `Lỗi Apple: ${nativeError || 'Không có'}`,
        `Token trên server: ${serverTokens > 0 ? '✅ ' + serverTokens + ' token(s)' : '❌ 0'}`,
        '',
        '--- LOG TỪ NATIVE (mới nhất trước) ---',
        serverLogs,
      ].join('\n');

      alert(status);

      // Nếu có token, thử gửi test push
      if (cachedToken || serverTokens > 0) {
        const testRes = await fetch('/api/admin/test-push', { method: 'POST' });
        const testData = await testRes.json().catch(() => ({}));
        alert(`Test push: ${testData.sent ? '✅ Đã gửi!' : '❌ ' + (testData.error || 'Lỗi')}`);
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
