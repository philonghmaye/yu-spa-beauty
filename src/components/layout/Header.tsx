'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FiMenu, FiX, FiPhone, FiUser, FiLogIn } from 'react-icons/fi';

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/dich-vu', label: 'Dịch vụ' },
  { href: '/bang-gia', label: 'Bảng giá' },
  { href: '/gioi-thieu', label: 'Giới thiệu' },
  { href: '/lien-he', label: 'Liên hệ' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  const isAdmin = session?.user && (session.user as { role?: string }).role === 'ADMIN';

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link href="/" className="header-logo">
            <span>YURI SPA BEAUTY</span>
          </Link>

          <nav>
            <ul className="header-nav">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-actions">
            {session?.user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="btn btn-ghost btn-sm" style={{ fontSize: '0.85rem' }}>
                    Admin
                  </Link>
                )}
                <Link href="/tai-khoan" className="btn btn-ghost btn-sm" style={{ fontSize: '0.85rem' }}>
                  <FiUser /> {session.user.name?.split(' ').pop()}
                </Link>
                <Link href="/dat-lich" className="btn btn-primary btn-sm">
                  Đặt lịch
                </Link>
              </>
            ) : (
              <>
                <Link href="/dang-nhap" className="btn btn-ghost btn-sm" style={{ fontSize: '0.85rem' }}>
                  <FiLogIn /> Đăng nhập
                </Link>
                <Link href="/dat-lich" className="btn btn-primary btn-sm">
                  Đặt lịch ngay
                </Link>
              </>
            )}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        {session?.user ? (
          <>
            <Link href="/tai-khoan" onClick={() => setMobileOpen(false)}>
              <FiUser style={{ marginRight: '8px' }} /> Tài khoản
            </Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileOpen(false)}>
                Admin Dashboard
              </Link>
            )}
          </>
        ) : (
          <Link href="/dang-nhap" onClick={() => setMobileOpen(false)}>
            <FiLogIn style={{ marginRight: '8px' }} /> Đăng nhập
          </Link>
        )}
        <Link
          href="/dat-lich"
          className="btn btn-primary"
          style={{ marginTop: '20px', width: '100%' }}
          onClick={() => setMobileOpen(false)}
        >
          Đặt lịch ngay
        </Link>
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neutral-500)' }}>
          <FiPhone /> 0123 456 789
        </div>
      </div>
    </>
  );
}
