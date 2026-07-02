'use client';

import { useState } from 'react';
import { isNative, getPlatform } from '@/lib/native';
import { FiBell } from 'react-icons/fi';

async function debugLog(event: string, data: string) {
  try {
    await fetch('/api/push-debug-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data, bundleId: 'com.yurispa.beauty' }),
    });
  } catch {}
}

export default function PushDebugButton() {
  const [loading, setLoading] = useState(false);

  const handleDebugPush = async () => {
    try {
      setLoading(true);
      
      const results: string[] = [];
      results.push('📱 CHẨN ĐOÁN PUSH NOTIFICATION');
      results.push(`Native: ${isNative() ? '✅' : '❌'}`);
      results.push(`Platform: ${getPlatform()}`);
      
      if (!isNative()) {
        results.push('\n❌ Chỉ hoạt động trên App iOS');
        alert(results.join('\n'));
        return;
      }

      const { PushNotifications } = await import('@capacitor/push-notifications');
      
      // Step 1: Check permissions
      const perms = await PushNotifications.checkPermissions();
      results.push(`\nQuyền hiện tại: ${perms.receive}`);
      await debugLog('DEBUG_PERM_CHECK', perms.receive);

      if (perms.receive !== 'granted') {
        const newPerm = await PushNotifications.requestPermissions();
        results.push(`Xin quyền mới: ${newPerm.receive}`);
        await debugLog('DEBUG_PERM_REQUEST', newPerm.receive);
        if (newPerm.receive !== 'granted') {
          results.push('\n❌ Người dùng từ chối quyền thông báo');
          alert(results.join('\n'));
          return;
        }
      }

      // Step 2: Remove old listeners and re-register
      await PushNotifications.removeAllListeners();
      results.push('Đã xóa listeners cũ');
      await debugLog('DEBUG_LISTENERS_CLEARED', 'OK');

      // Step 3: Register with timeout
      results.push('\n⏳ Đang đăng ký với Apple...');
      results.push('(Đợi 20 giây)');
      
      const registerResult = await new Promise<{token: string | null, error: string | null}>((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ token: null, error: 'TIMEOUT - Apple không phản hồi sau 20 giây' });
        }, 20000);

        PushNotifications.addListener('registration', async (token) => {
          clearTimeout(timeout);
          await debugLog('DEBUG_TOKEN_OK', token.value);
          resolve({ token: token.value, error: null });
        });

        PushNotifications.addListener('registrationError', async (err) => {
          clearTimeout(timeout);
          await debugLog('DEBUG_TOKEN_ERROR', JSON.stringify(err));
          resolve({ token: null, error: JSON.stringify(err) });
        });

        PushNotifications.register();
        debugLog('DEBUG_REGISTER_CALLED', 'Waiting for Apple response...');
      });

      if (registerResult.token) {
        localStorage.setItem('cached_push_token', registerResult.token);
        results.length = 0; // Clear
        results.push('✅ THÀNH CÔNG!');
        results.push(`Token: ${registerResult.token.substring(0, 20)}...`);
        
        // Save to server
        try {
          await fetch('/api/push-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: registerResult.token, platform: 'ios' }),
          });
          results.push('Đã lưu server ✅');

          // Test push
          const testRes = await fetch('/api/admin/test-push', { method: 'POST' });
          const testData = await testRes.json().catch(() => ({}));
          results.push(`Test push: ${testData.sent ? '✅ Đã gửi!' : '❌ Lỗi'}`);
        } catch {
          results.push('Lỗi lưu server ❌');
        }
      } else {
        await debugLog('DEBUG_TIMEOUT', registerResult.error || 'unknown');
        results.length = 0;
        results.push('❌ APPLE KHÔNG TRẢ TOKEN');
        results.push(`\nLỗi: ${registerResult.error}`);
        results.push('\n--- NGUYÊN NHÂN CÓ THỂ ---');
        results.push('1. Push chưa bật cho App ID trên Apple Developer Portal');
        results.push('2. Mạng chặn kết nối tới Apple APNs');
        results.push('3. Thử KẾT NỐI WIFI KHÁC rồi mở lại app');
        results.push('4. Kiểm tra: Cài đặt → Thông báo → Yuri Spa');
      }
      
      // Read server logs
      try {
        const logRes = await fetch('/api/push-debug-log');
        const logData = await logRes.json();
        if (logData.logs?.length > 0) {
          results.push('\n--- LOG SERVER (5 mới nhất) ---');
          logData.logs.slice(0, 5).forEach((l: any) => {
            results.push(`${new Date(l.createdAt).toLocaleTimeString('vi-VN')}: ${l.content}`);
          });
        }
      } catch {}

      alert(results.join('\n'));

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
      <FiBell /> {loading ? 'Đang kiểm tra (đợi 20s)...' : 'Chẩn đoán Thông Báo'}
    </button>
  );
}
