import Link from 'next/link';
import { FiHome, FiCalendar, FiScissors, FiUsers, FiUserCheck, FiBarChart2, FiGift, FiStar, FiSettings, FiArrowLeft } from 'react-icons/fi';
import AdminNotificationBell from '@/components/AdminNotificationBell';

const adminNav = [
  { href: '/admin', label: 'Tổng quan', icon: <FiHome /> },
  { href: '/admin/lich-hen', label: 'Lịch hẹn', icon: <FiCalendar /> },
  { href: '/admin/dich-vu', label: 'Dịch vụ', icon: <FiScissors /> },
  { href: '/admin/nhan-vien', label: 'Nhân viên', icon: <FiUserCheck /> },
  { href: '/admin/khach-hang', label: 'Khách hàng', icon: <FiUsers /> },
  { href: '/admin/khuyen-mai', label: 'Khuyến mãi', icon: <FiGift /> },
  { href: '/admin/danh-gia', label: 'Đánh giá', icon: <FiStar /> },
  { href: '/admin/thong-ke', label: 'Thống kê', icon: <FiBarChart2 /> },
  { href: '/admin/cai-dat', label: 'Cài đặt', icon: <FiSettings /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <span>YURI SPA BEAUTY</span>
        </div>
        <nav>
          <ul className="admin-nav">
            {adminNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
            <li style={{ marginTop: '32px', borderTop: '1px solid var(--neutral-700)', paddingTop: '16px' }}>
              <Link href="/">
                <span className="nav-icon"><FiArrowLeft /></span>
                Về trang chủ
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <span className="admin-topbar-greeting">Bảng điều khiển</span>
          </div>
          <div className="admin-topbar-right">
            <AdminNotificationBell />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

