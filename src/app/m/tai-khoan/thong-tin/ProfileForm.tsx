'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { updateProfile } from '@/actions/account';
import toast from 'react-hot-toast';

export default function ProfileForm({ user }: {
  user: { id: string; name: string; phone: string | null; email: string | null };
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [saving, setSaving] = useState(false);

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
        <button className="m-btn-submit" onClick={handleSave} disabled={saving} style={{ marginTop: 8 }}>
          <FiSave style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </>
  );
}
