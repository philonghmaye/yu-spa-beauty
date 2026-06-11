'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiAlertTriangle } from 'react-icons/fi';
import { updateProfile, deleteAccountAction } from '@/actions/account';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function ProfileForm({ user }: {
  user: { id: string; name: string; phone: string | null; email: string | null };
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, phone, email });
      toast.success('Đã cập nhật thông tin');
      router.back();
    } catch {
      toast.error('Cập nhật thất bại');
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Bạn có chắc chắn muốn xóa tài khoản? Hành động này sẽ xóa vĩnh viễn tất cả thông tin cá nhân, lịch sử đặt lịch hẹn và hạng thành viên của bạn. Điều này KHÔNG thể hoàn tác.'
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const res = await deleteAccountAction();
      if (res.success) {
        toast.success('Tài khoản đã được xóa thành công');
        await signOut({ callbackUrl: '/m/dang-nhap' });
      } else {
        toast.error('Có lỗi xảy ra khi xóa tài khoản');
      }
    } catch {
      toast.error('Không thể kết nối đến máy chủ để xóa tài khoản');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="m-topbar">
        <button className="m-topbar-back" onClick={() => router.back()}><FiArrowLeft /></button>
        <span className="m-topbar-title">Thông tin cá nhân</span>
      </div>

      <div style={{ padding: 16 }}>
        <div className="form-group">
          <label className="form-label">Họ tên</label>
          <input className="form-input" style={{ borderRadius: 'var(--radius)' }} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Số điện thoại</label>
          <input className="form-input" style={{ borderRadius: 'var(--radius)' }} value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" style={{ borderRadius: 'var(--radius)' }} value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <button className="m-btn-submit" onClick={handleSave} disabled={saving || deleting} style={{ marginTop: 8 }}>
          <FiSave style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>

        {/* Danger Zone for App Store Deletion Requirement */}
        <div style={{ marginTop: 32, borderTop: '1px solid var(--neutral-200)', paddingTop: 20 }}>
          <h4 style={{ color: 'var(--error)', marginBottom: 6, fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiAlertTriangle /> Khu vực nguy hiểm
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: 16, lineHeight: 1.5 }}>
            Xóa tài khoản của bạn sẽ xóa vĩnh viễn toàn bộ lịch sử đặt lịch hẹn, đánh giá và quyền lợi thành viên tại Yuri Spa Beauty.
          </p>
          <button 
            className="m-btn-submit" 
            onClick={handleDeleteAccount} 
            disabled={saving || deleting} 
            style={{ 
              background: 'var(--error)', 
              color: '#fff',
              fontSize: '0.9rem',
              padding: '12px'
            }}
          >
            {deleting ? 'Đang thực hiện xóa...' : 'Xóa tài khoản vĩnh viễn'}
          </button>
        </div>
      </div>
    </>
  );
}
