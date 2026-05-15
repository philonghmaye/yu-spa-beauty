import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { FiUser, FiCalendar, FiStar, FiLogOut } from 'react-icons/fi';

const accountNav = [
  { href: '/tai-khoan', label: 'Tổng quan', icon: <FiUser /> },
  { href: '/tai-khoan/lich-su', label: 'Lịch sử đặt lịch', icon: <FiCalendar /> },
  { href: '/tai-khoan/danh-gia', label: 'Đánh giá của tôi', icon: <FiStar /> },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/dang-nhap');
  }

  return (
    <>
      <Header />
      <div style={{ paddingTop: 'var(--header-height)' }}>
        <div className="page-header" style={{ padding: '80px 0 40px' }}>
          <div className="container">
            <h1>Tài khoản của tôi</h1>
            <p>Quản lý thông tin và lịch hẹn của bạn</p>
          </div>
        </div>

        <section className="section" style={{ paddingTop: '32px' }}>
          <div className="container">
            <div className="account-layout">
              <aside className="account-sidebar">
                <nav>
                  <ul style={{ listStyle: 'none' }}>
                    {accountNav.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className="account-nav-link">
                          <span className="account-nav-icon">{item.icon}</span>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    <li style={{ marginTop: '16px', borderTop: '1px solid var(--neutral-200)', paddingTop: '16px' }}>
                      <Link href="/api/auth/signout" className="account-nav-link" style={{ color: 'var(--error)' }}>
                        <span className="account-nav-icon"><FiLogOut /></span>
                        Đăng xuất
                      </Link>
                    </li>
                  </ul>
                </nav>
              </aside>
              <main className="account-content">
                {children}
              </main>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
