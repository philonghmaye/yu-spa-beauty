import './mobile.css';
import MobileTabBar from './MobileTabBar';
import MobileLangWrapper from './MobileLangWrapper';

export const metadata = {
  title: 'YURI SPA BEAUTY — Đặt lịch Spa',
  description: 'Đặt lịch spa và làm đẹp chuyên nghiệp',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
};

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-app">
      <MobileLangWrapper>
        {children}
        <MobileTabBar />
      </MobileLangWrapper>
    </div>
  );
}
