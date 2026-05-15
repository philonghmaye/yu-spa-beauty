'use client';

import { signOutAction } from '@/actions/auth';
import { FiLogOut } from 'react-icons/fi';

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOutAction();
  };

  return (
    <button
      onClick={handleLogout}
      className="account-nav-link"
      style={{
        color: 'var(--error)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: 'inherit',
        fontFamily: 'inherit',
      }}
    >
      <span className="account-nav-icon"><FiLogOut /></span>
      Đăng xuất
    </button>
  );
}
