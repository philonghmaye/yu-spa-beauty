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
      results.push('📱 CHẨN ĐOÁN PUSH v3');
      results.push(`Native: ${isNative() ? '✅' : '❌'}`);
      results.push(`Platform: ${getPlatform()}`);
      
      if (!isNative()) {
        results.push('\n❌ Chỉ hoạt động trên App iOS');
        alert(results.join('\n'));
        return;
      }

      const { PushNotifications } = await import('@capacitor/push-notifications');
      const { Capacitor } = await import('@capacitor/core');
      
      // Step 0: Call NATIVE diagnostic plugin directly
      try {
        const diag = await (Capacitor as any).Plugins.PushDiag.diagnose();
        results.push('\n🔧 NATIVE DIAG (trực tiếp từ iOS):');
        results.push(`isRegisteredBefore: ${diag.isRegisteredBefore}`);
        results.push(`isRegisteredAfter: ${diag.isRegisteredAfter}`);
        results.push(`authStatus: ${diag.authorizationStatus}`);
        results.push(`bundleId: ${diag.bundleId}`);
        results.push(`apsEnv: ${diag.apsEnvironment}`);
        results.push(`pluginLoaded: ${diag.pluginLoaded}`);
      } catch (e: any) {
        results.push(`\n⚠️ Native plugin error: ${e.message || e}`);
      }
      
      // Step 1: Check permissions
      const perms = await PushNotifications.checkPermissions();
      results.push(`\nQuyền: ${perms.receive}`);
      await debugLog('V3_PERM', perms.receive);

      if (perms.receive !== 'granted') {
        const newPerm = await PushNotifications.requestPermissions();
        results.push(`Xin quyền: ${newPerm.receive}`);
        if (newPerm.receive !== 'granted') {
          results.push('\n❌ Từ chối quyền thông báo');
          alert(results.join('\n'));
          return;
        }
      }

      // Step 2: Check cached token from native (via localStorage injection)
      const cachedToken = localStorage.getItem('cached_push_token');
      const nativeError = localStorage.getItem('apns_native_error');
      results.push(`\nCached token: ${cachedToken ? cachedToken.substring(0, 16) + '...' : 'KHÔNG CÓ'}`);
      results.push(`Native error: ${nativeError || 'không'}`);
      await debugLog('V3_CACHED', `token=${cachedToken ? 'yes' : 'no'}, error=${nativeError || 'none'}`);

      // Step 3: Remove old listeners, re-register with 30s timeout
      await PushNotifications.removeAllListeners();
      results.push('\n⏳ Đang đăng ký (đợi 30 giây)...');
      
      const registerResult = await new Promise<{token: string | null, error: string | null}>((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ token: null, error: 'TIMEOUT 30s - Apple không phản hồi' });
        }, 30000);

        PushNotifications.addListener('registration', async (token) => {
          clearTimeout(timeout);
          await debugLog('V3_TOKEN_OK', token.value.substring(0, 20));
          resolve({ token: token.value, error: null });
        });

        PushNotifications.addListener('registrationError', async (err) => {
          clearTimeout(timeout);
          const errStr = JSON.stringify(err);
          await debugLog('V3_TOKEN_ERROR', errStr);
          resolve({ token: null, error: errStr });
        });

        PushNotifications.register();
        debugLog('V3_REGISTER_CALLED', 'waiting...');
      });

      if (registerResult.token) {
        localStorage.setItem('cached_push_token', registerResult.token);

        results.push('✅ THÀNH CÔNG!');
        results.push(`Token: ${registerResult.token.substring(0, 20)}...`);
        
        try {
          await fetch('/api/push-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: registerResult.token, platform: 'ios' }),
          });
          results.push('Đã lưu server ✅');
        } catch {
          results.push('Lỗi lưu server ❌');
        }
      } else {
        await debugLog('V3_FAILED', registerResult.error || 'unknown');
        results.push('\n❌ APPLE KHÔNG TRẢ TOKEN');
        results.push(`\nLỗi: ${registerResult.error}`);
        results.push('\n--- CÒN THỬ ---');
        results.push('1. XÓA app → Cài đặt → General → VPN & Device Management → xóa profile → cài lại từ TestFlight');
        results.push('2. Kiểm tra: Cài đặt → Thông báo → Yuri Spa → BẬT cho phép');
        results.push('3. Restart điện thoại');
        results.push('4. Thử kết nối mạng khác');
      }
      
      // Read server logs
      try {
        const logRes = await fetch('/api/push-debug-log');
        const logData = await logRes.json();
        if (logData.logs?.length > 0) {
          results.push('\n--- LOG (3 mới nhất) ---');
          logData.logs.slice(0, 3).forEach((l: any) => {
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
      <FiBell /> {loading ? 'Đang kiểm tra (30s)...' : 'Chẩn đoán Thông Báo v3'}
    </button>
  );
}
