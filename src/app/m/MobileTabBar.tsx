'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiGrid, FiClock, FiUser } from 'react-icons/fi';
import { useLang } from './LangContext';

export default function MobileTabBar() {
  const pathname = usePathname();
  const { t } = useLang();

  const tabs = [
    { href: '/m', label: t.home, icon: <FiHome />, exact: true },
    { href: '/m/dich-vu', label: t.services, icon: <FiGrid /> },
    { href: '/m/hoat-dong', label: t.activity, icon: <FiClock /> },
    { href: '/m/tai-khoan', label: t.account, icon: <FiUser /> },
  ];

  // Hide tab bar on certain pages
  const hideOn = ['/m/dang-nhap', '/m/dang-ky', '/m/dat-lich'];
  if (hideOn.some(p => pathname.startsWith(p))) return null;

  return (
    <div className="mobile-tabs">
      <div className="mobile-tabs-inner">
        {tabs.map((tab) => {
          const isActive = (tab as { exact?: boolean }).exact
            ? pathname === tab.href
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
