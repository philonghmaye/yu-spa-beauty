'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiCalendar, FiUsers, FiBarChart2, FiSettings } from 'react-icons/fi';

const tabs = [
  { href: '/m/admin', label: 'Tổng quan', icon: <FiHome />, exact: true },
  { href: '/m/admin/lich-hen', label: 'Lịch hẹn', icon: <FiCalendar /> },
  { href: '/m/admin/nhan-vien', label: 'Nhân viên', icon: <FiUsers /> },

  { href: '/m/admin/cai-dat', label: 'Cài đặt', icon: <FiSettings /> },
];

export default function AdminMobileTabBar() {
  const pathname = usePathname();

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: '1px solid var(--neutral-100)',
      display: 'flex', justifyContent: 'space-around', padding: '6px 0 env(safe-area-inset-bottom, 8px)',
      zIndex: 100,
    }}>
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 2, textDecoration: 'none', fontSize: '0.65rem', padding: '4px 6px',
              color: isActive ? 'var(--primary)' : 'var(--neutral-400)',
              fontWeight: isActive ? 600 : 400,
              transition: 'color 0.2s',
            }}
          >
            <span style={{ fontSize: '1.15rem' }}>{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
