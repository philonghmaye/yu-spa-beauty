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

// ==================== PUSH NOTIFICATIONS ====================
export async function initPushNotifications() {
  if (!isNative()) return;

  const { PushNotifications } = await import('@capacitor/push-notifications');

  // Xin quyền
  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') {
    console.log('Push notification permission denied');
    return;
  }

  // Đăng ký nhận push
  await PushNotifications.register();

  // Lắng nghe token
  PushNotifications.addListener('registration', (token) => {
    console.log('Push token:', token.value);
    // Gửi token lên server để lưu
    savePushToken(token.value);
  });

  // Lắng nghe lỗi
  PushNotifications.addListener('registrationError', (error) => {
    console.error('Push registration error:', error);
  });

  // Lắng nghe notification khi app đang mở
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received:', notification);
  });

  // Lắng nghe khi user tap vào notification
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('Push action:', action);
    // Navigate đến trang phù hợp
    const data = action.notification.data;
    if (data?.appointmentId) {
      window.location.href = '/m/hoat-dong';
    }
  });
}

// Lưu push token lên server
export async function savePushToken(token: string) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cached_push_token', token);
    }
    await fetch('/api/push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: getPlatform() }),
    });
  } catch (e) {
    console.error('Failed to save push token:', e);
  }
}

export async function retrySavePushToken() {
  if (!isNative() || typeof window === 'undefined') return;
  const token = localStorage.getItem('cached_push_token');
  if (token) {
    await savePushToken(token);
  }
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

  // Xử lý app resume
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      console.log('App resumed');
      // Refresh data khi app quay lại foreground
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
