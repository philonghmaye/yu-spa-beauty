'use client';

import { useState } from 'react';
import { FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function DeleteAccountButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'XÓA TÀI KHOẢN') return;
    
    setDeleting(true);
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      
      toast.success('Tài khoản đã được xóa');
      // Sign out and redirect
      await signOut({ callbackUrl: '/m' });
    } catch {
      toast.error('Không thể xóa tài khoản. Vui lòng thử lại.');
      setDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div style={{
        background: 'var(--error-light)', borderRadius: 16, padding: 20,
        border: '1px solid rgba(239,68,68,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--error)' }}>
          <FiAlertTriangle style={{ fontSize: '1.2rem' }} />
          <strong style={{ fontSize: '0.95rem' }}>Xóa tài khoản vĩnh viễn</strong>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--neutral-600)', marginBottom: 16, lineHeight: 1.6 }}>
          Hành động này <strong>không thể hoàn tác</strong>. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn, bao gồm:
          lịch sử đặt lịch, đánh giá, thông tin cá nhân, và điểm thưởng.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--neutral-700)', marginBottom: 10 }}>
          Nhập <strong>XÓA TÀI KHOẢN</strong> để xác nhận:
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder="XÓA TÀI KHOẢN"
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 8,
            border: '1.5px solid var(--neutral-200)', fontSize: '0.9rem',
            marginBottom: 14, fontFamily: 'inherit', outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => { setShowConfirm(false); setConfirmText(''); }}
            style={{
              flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid var(--neutral-200)',
              background: '#fff', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', color: 'var(--neutral-600)',
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== 'XÓA TÀI KHOẢN' || deleting}
            style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none',
              background: confirmText === 'XÓA TÀI KHOẢN' ? 'var(--error)' : 'var(--neutral-200)',
              color: confirmText === 'XÓA TÀI KHOẢN' ? '#fff' : 'var(--neutral-400)',
              fontSize: '0.88rem', fontWeight: 600, cursor: confirmText === 'XÓA TÀI KHOẢN' ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', opacity: deleting ? 0.5 : 1,
            }}
          >
            {deleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      style={{
        width: '100%', padding: '14px', borderRadius: 12,
        border: '1.5px solid rgba(239,68,68,0.2)', background: 'transparent',
        color: 'var(--error)', fontSize: '0.88rem', fontWeight: 500,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: 'inherit',
      }}
    >
      <FiTrash2 /> Xóa tài khoản
    </button>
  );
}
