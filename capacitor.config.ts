import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yurispa.beauty',
  appName: 'Yuri Spa Beauty',
  webDir: 'out',
  // Trỏ tới URL Vercel khi chạy trên iOS
  // Thay URL bên dưới bằng domain Vercel thật của bạn
  server: {
    url: 'https://yu-spa-beauty.vercel.app/m',
    cleartext: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#7c3aed',
      showSpinner: true,
      spinnerColor: '#ffffff',
      androidSpinnerStyle: 'small',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#7c3aed',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#7c3aed',
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'yurispa',
  },
};

export default config;
