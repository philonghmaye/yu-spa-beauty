'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiClock, FiUser } from 'react-icons/fi';

const tabs = [
  { href: '/m', label: 'Khám phá', icon: <FiHome /> },
  { href: '/m/hoat-dong', label: 'Hoạt động', icon: <FiClock /> },
  { href: '/m/tai-khoan', label: 'Tài khoản', icon: <FiUser /> },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  // Hide tab bar on certain pages
  const hideOn = ['/m/dang-nhap', '/m/dang-ky', '/m/dat-lich'];
  if (hideOn.some(p => pathname.startsWith(p))) return null;

  return (
    <div className="mobile-tabs">
      <div className="mobile-tabs-inner">
        {tabs.map((tab) => {
          const isActive = tab.href === '/m'
            ? pathname === '/m'
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`mobile-tab ${isActive ? 'active' : ''}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
