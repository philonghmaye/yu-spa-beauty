import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yurispa.beauty',
  appName: 'Yuri Spa Beauty',
  webDir: 'out',
  // Trỏ tới URL Vercel khi chạy trên iOS
  // Thay URL bên dưới bằng domain Vercel thật của bạn
  server: {
    url: 'https://yuri-spa-beauty.vercel.app/m',
    cleartext: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#FFFDF7',
      showSpinner: true,
      spinnerColor: '#C44569',
      androidSpinnerStyle: 'small',
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#FFFDF7',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#C44569',
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'yurispa',
  },
};

export default config;
