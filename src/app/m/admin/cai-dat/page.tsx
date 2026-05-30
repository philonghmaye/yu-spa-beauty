import { auth } from '@/lib/auth';
import Link from 'next/link';
import { FiUser, FiLogOut, FiMonitor, FiSmartphone, FiTag, FiStar, FiGrid } from 'react-icons/fi';
import AdminLogoutButton from './AdminLogoutButton';

export default async function AdminSettingsPage() {
  const session = await auth();

  const menuItems = [
    { icon: <FiMonitor />, label: 'Admin Desktop', href: '/admin', desc: 'Quản lý đầy đủ trên máy tính' },
    { icon: <FiGrid />, label: 'Quản lý dịch vụ', href: '/admin/dich-vu', desc: 'Thêm, sửa, xóa dịch vụ' },
    { icon: <FiUser />, label: 'Quản lý khách hàng', href: '/admin/khach-hang', desc: 'Xem danh sách khách hàng' },
    { icon: <FiTag />, label: 'Khuyến mãi', href: '/admin/khuyen-mai', desc: 'Quản lý mã giảm giá' },
    { icon: <FiStar />, label: 'Đánh giá', href: '/admin/danh-gia', desc: 'Xem đánh giá từ khách hàng' },
  ];

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', padding: '20px 16px', color: '#fff' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>⚙️ Cài đặt</h1>
        <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 2 }}>{session?.user?.name || 'Admin'}</div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Admin Profile */}
        <div style={{
          background: '#fff', borderRadius: 12, padding: '16px',
          marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: '#f3e8ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', color: '#7c3aed', fontWeight: 700,
          }}>
            {(session?.user?.name || 'A').charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{session?.user?.name || 'Admin'}</div>
            <div style={{ fontSize: '0.78rem', color: '#888' }}>{session?.user?.email || 'admin@yurispa.vn'}</div>
            <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 500 }}>Quản trị viên</div>
          </div>
        </div>

        {/* Menu */}
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 16 }}>
          {menuItems.map((item, i) => (
            <Link key={i} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', textDecoration: 'none', color: 'inherit',
              borderBottom: i < menuItems.length - 1 ? '1px solid #f5f5f5' : 'none',
            }}>
              <span style={{ fontSize: '1.1rem', color: '#7c3aed' }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>{item.desc}</div>
              </div>
              <span style={{ color: '#ccc', fontSize: '0.8rem' }}>›</span>
            </Link>
          ))}
        </div>

        {/* App Version */}
        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.75rem', color: '#ccc' }}>
          <FiSmartphone style={{ verticalAlign: 'middle', marginRight: 4 }} />
          YURI SPA BEAUTY Admin v1.0
        </div>

        {/* Switch to Customer App */}
        <Link href="/m" style={{
          display: 'block', padding: '12px', borderRadius: 10,
          background: '#f3e8ff', color: '#7c3aed', textDecoration: 'none',
          textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, marginBottom: 12,
        }}>
          📱 Chuyển sang App khách hàng
        </Link>

        {/* Logout */}
        <AdminLogoutButton />
      </div>
    </>
  );
}
