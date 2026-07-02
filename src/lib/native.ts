/**
 * Capacitor Native Bridge
 * Cung cấp các tính năng native cho iOS app:
 * - Push Notifications
 * - Local Notifications (nhắc lịch hẹn)
 * - Haptic Feedback
 * - Share
 * - Status Bar
 */

import { Capacitor } from '@capacitor/core';

// Kiểm tra app đang chạy native hay web
export const isNative = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

/**
 * Ghi log chẩn đoán lên server (hoạt động cả khi console.log không thấy được)
 */
async function pushDebugLog(event: string, data: string) {
  try {
    await fetch('/api/push-debug-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data, bundleId: 'com.yurispa.beauty' }),
    });
  } catch {}
}

// Flag để tránh gắn listener trùng
let pushListenersAttached = false;

/**
 * Khởi tạo Push Notifications.
 * GẮN listener TRƯỚC, rồi mới gọi register().
 * Token được lưu localStorage ngay khi nhận, gửi server sau.
 */
export async function initPushNotifications() {
  if (!isNative()) return;

  await pushDebugLog('JS_INIT_START', `platform=${getPlatform()}`);

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    await pushDebugLog('JS_PLUGIN_LOADED', 'OK');

    // Xin quyền
    const permission = await PushNotifications.requestPermissions();
    await pushDebugLog('JS_PERMISSION', `receive=${permission.receive}`);
    
    if (permission.receive !== 'granted') {
      await pushDebugLog('JS_PERMISSION_DENIED', 'User denied');
      return;
    }

    // Gắn listener TRƯỚC khi gọi register (quan trọng!)
    if (!pushListenersAttached) {
      // Lắng nghe token - LƯU NGAY VÀO LOCALSTORAGE
      PushNotifications.addListener('registration', async (token) => {
        await pushDebugLog('JS_TOKEN_RECEIVED', token.value.substring(0, 20) + '...');
        if (typeof window !== 'undefined') {
          localStorage.setItem('cached_push_token', token.value);
        }
        savePushTokenToServer(token.value);
      });

      // Lắng nghe lỗi
      PushNotifications.addListener('registrationError', async (error) => {
        await pushDebugLog('JS_REGISTER_ERROR', JSON.stringify(error));
      });

      // Lắng nghe notification khi app đang mở
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received:', notification);
      });

      // Lắng nghe khi user tap vào notification
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        const data = action.notification.data;
        if (data?.appointmentId) {
          window.location.href = '/m/hoat-dong';
        }
      });

      pushListenersAttached = true;
      await pushDebugLog('JS_LISTENERS_ATTACHED', 'OK');
    }

    // Đăng ký nhận push (listeners đã sẵn sàng ở trên)
    await pushDebugLog('JS_REGISTER_CALLING', 'About to call PushNotifications.register()');
    await PushNotifications.register();
    await pushDebugLog('JS_REGISTER_CALLED', 'register() returned successfully');

    // Đợi 15 giây rồi kiểm tra kết quả
    setTimeout(async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('cached_push_token') : null;
      await pushDebugLog('JS_CHECK_AFTER_15S', token ? `TOKEN_OK: ${token.substring(0, 20)}...` : 'NO_TOKEN');
    }, 15000);

  } catch (error: any) {
    await pushDebugLog('JS_INIT_ERROR', error.message || String(error));
  }
}

/**
 * Gửi push token lên server.
 * Tách riêng khỏi việc lưu localStorage để có thể retry.
 */
async function savePushTokenToServer(token: string) {
  try {
    const response = await fetch('/api/push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: getPlatform() }),
    });
    if (response.ok) {
      console.log('Push token saved to server successfully');
    } else {
      console.warn('Failed to save push token to server:', response.status);
    }
  } catch (e) {
    console.error('Failed to save push token:', e);
  }
}

/**
 * Lưu push token - gọi từ bên ngoài (ví dụ: nút Debug)
 */
export async function savePushToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cached_push_token', token);
  }
  await savePushTokenToServer(token);
}

/**
 * GỬI LẠI token lên server (gọi sau khi đăng nhập)
 * Quan trọng: Đây là cơ chế đảm bảo token luôn được gắn với user đúng
 */
export async function retrySavePushToken() {
  if (!isNative() || typeof window === 'undefined') return;
  const token = localStorage.getItem('cached_push_token');
  if (token) {
    console.log('Retrying save push token to server...');
    await savePushTokenToServer(token);
  }
}

/**
 * Đăng ký lại Push Notifications (dùng cho nút Debug hoặc sau khi cài đặt quyền lại)
 * Xóa tất cả listener cũ, gắn mới, và gọi register() lại
 */
export async function reRegisterPush(): Promise<{
  permission: string;
  token: string | null;
  error: string | null;
}> {
  if (!isNative()) {
    return { permission: 'web', token: null, error: 'Không phải native app' };
  }

  const { PushNotifications } = await import('@capacitor/push-notifications');

  // Check permission
  const perm = await PushNotifications.checkPermissions();
  if (perm.receive !== 'granted') {
    const newPerm = await PushNotifications.requestPermissions();
    if (newPerm.receive !== 'granted') {
      return { permission: 'denied', token: null, error: 'Người dùng từ chối quyền thông báo' };
    }
  }

  // Xóa tất cả listener cũ
  await PushNotifications.removeAllListeners();
  pushListenersAttached = false;

  // Tạo promise để chờ kết quả registration
  return new Promise((resolve) => {
    // Timeout 10 giây
    const timeout = setTimeout(() => {
      const cachedToken = localStorage.getItem('cached_push_token');
      resolve({
        permission: 'granted',
        token: cachedToken,
        error: cachedToken ? null : 'Apple không phản hồi sau 10 giây. Có thể do entitlements hoặc Provisioning Profile chưa đúng.',
      });
    }, 10000);

    PushNotifications.addListener('registration', (token) => {
      clearTimeout(timeout);
      localStorage.setItem('cached_push_token', token.value);
      savePushTokenToServer(token.value);
      resolve({
        permission: 'granted',
        token: token.value,
        error: null,
      });
    });

    PushNotifications.addListener('registrationError', (error) => {
      clearTimeout(timeout);
      resolve({
        permission: 'granted',
        token: null,
        error: `Apple từ chối: ${JSON.stringify(error)}`,
      });
    });

    // Lắng nghe notification khi app đang mở
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const data = action.notification.data;
      if (data?.appointmentId) {
        window.location.href = '/m/hoat-dong';
      }
    });

    pushListenersAttached = true;

    // Gọi register
    PushNotifications.register();
  });
}

// ==================== LOCAL NOTIFICATIONS ====================
export async function scheduleAppointmentReminder(
  appointmentId: string,
  title: string,
  body: string,
  scheduledDate: Date
) {
  if (!isNative()) return;

  const { LocalNotifications } = await import('@capacitor/local-notifications');

  // Xin quyền
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== 'granted') return;

  // Nhắc trước 2 giờ
  const reminderDate = new Date(scheduledDate.getTime() - 2 * 60 * 60 * 1000);
  if (reminderDate <= new Date()) return; // Đã qua thời gian nhắc

  await LocalNotifications.schedule({
    notifications: [
      {
        id: hashCode(appointmentId),
        title,
        body,
        schedule: { at: reminderDate },
        extra: { appointmentId },
        smallIcon: 'ic_stat_icon',
      },
    ],
  });
}

export async function cancelAppointmentReminder(appointmentId: string) {
  if (!isNative()) return;

  const { LocalNotifications } = await import('@capacitor/local-notifications');
  await LocalNotifications.cancel({
    notifications: [{ id: hashCode(appointmentId) }],
  });
}

// ==================== HAPTIC FEEDBACK ====================
export async function hapticSuccess() {
  if (!isNative()) return;
  const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
  await Haptics.impact({ style: ImpactStyle.Medium });
}

export async function hapticLight() {
  if (!isNative()) return;
  const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
  await Haptics.impact({ style: ImpactStyle.Light });
}

export async function hapticError() {
  if (!isNative()) return;
  const { Haptics, NotificationType } = await import('@capacitor/haptics');
  await Haptics.notification({ type: NotificationType.Error });
}

// ==================== SHARE ====================
export async function shareService(title: string, url: string) {
  if (!isNative()) {
    // Fallback cho web
    if (navigator.share) {
      await navigator.share({ title, url });
    }
    return;
  }

  const { Share } = await import('@capacitor/share');
  await Share.share({
    title: `${title} - Yuri Spa Beauty`,
    text: `Khám phá dịch vụ ${title} tại Yuri Spa Beauty!`,
    url,
    dialogTitle: 'Chia sẻ dịch vụ',
  });
}

// ==================== STATUS BAR ====================
export async function setupStatusBar() {
  if (!isNative()) return;

  const { StatusBar, Style } = await import('@capacitor/status-bar');
  await StatusBar.setStyle({ style: Style.Dark });
  // iOS: status bar overlay
  await StatusBar.setOverlaysWebView({ overlay: false });
}

// ==================== APP LIFECYCLE ====================
export async function setupAppListeners() {
  if (!isNative()) return;

  const { App } = await import('@capacitor/app');

  // Xử lý deep link
  App.addListener('appUrlOpen', (event) => {
    const slug = event.url.split('yurispa://').pop();
    if (slug) {
      window.location.href = `/m/${slug}`;
    }
  });

  // Xử lý app resume — retry gửi push token mỗi lần app mở lại
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      console.log('App resumed');
      // Retry gửi push token khi app quay lại foreground
      retrySavePushToken();
    }
  });

  // Xử lý nút back (Android)
  App.addListener('backButton', () => {
    if (window.location.pathname === '/m') {
      App.exitApp();
    } else {
      window.history.back();
    }
  });
}

// ==================== SPLASH SCREEN ====================
export async function hideSplash() {
  if (!isNative()) return;
  const { SplashScreen } = await import('@capacitor/splash-screen');
  await SplashScreen.hide();
}

// ==================== IN-APP REVIEW ====================
/**
 * Request App Store review — Apple Guideline 4.2
 * Only triggers after successful booking, max once per session
 */
export async function requestAppReview() {
  // Only prompt once per session
  const key = 'review_prompted';
  if (sessionStorage.getItem(key)) return;

  // Only prompt on native platform
  if (!isNative()) return;

  try {
    // Dynamic import — package only available in native iOS build
    // @ts-ignore - installed via Capacitor plugin in iOS project
    const mod = await import('@nicepkg/capacitor-in-app-review');
    await mod.InAppReview.requestReview();
    sessionStorage.setItem(key, '1');
  } catch {
    // Silently fail — review prompt is optional
    console.log('In-App Review not available');
  }
}

// ==================== UTILITIES ====================
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
