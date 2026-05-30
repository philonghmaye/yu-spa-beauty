'use client';

import { signOut } from 'next-auth/react';
import { FiLogOut } from 'react-icons/fi';

export default function AdminLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/m' })}
      style={{
        width: '100%', padding: '12px', borderRadius: 10,
        background: '#fff', color: '#ef4444', border: '1px solid #fee2e2',
        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}
    >
      <FiLogOut /> Đăng xuất
    </button>
  );
}
