import Link from 'next/link';
import './mobile.css';
import { FiHome, FiClock, FiUser } from 'react-icons/fi';
import MobileTabBar from './MobileTabBar';

export const metadata = {
  title: 'YURI SPA BEAUTY — Đặt lịch Spa',
  description: 'Đặt lịch spa và làm đẹp chuyên nghiệp',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
};

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-app">
      {children}
      <MobileTabBar />
    </div>
  );
}
