import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'YURI SPA BEAUTY - Dịch vụ Spa & Làm đẹp chuyên nghiệp',
  description: 'YURI SPA BEAUTY cung cấp dịch vụ làm nail, chăm sóc da, nối mi, gội đầu, massage và các dịch vụ làm đẹp cao cấp. Đặt lịch online nhanh chóng, tiện lợi.',
  keywords: 'spa, làm đẹp, nail, massage, chăm sóc da, nối mi, đặt lịch online',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', padding: '12px 20px', fontSize: '0.9rem' },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

