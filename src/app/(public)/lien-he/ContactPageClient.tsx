'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMapPin, FiPhone, FiMail, FiClock, FiEdit2, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';

interface ContactData {
  contact_address: string;
  contact_phone: string;
  contact_email: string;
  contact_hours: string;
}

export default function ContactPageClient({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [data, setData] = useState<ContactData>({
    contact_address: '',
    contact_phone: '',
    contact_email: '',
    contact_hours: '',
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ContactData>(data);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/contact')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setForm(d);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setData(form);
        setEditing(false);
      }
    } catch {}
    setSaving(false);
  };

  const items = [
    { icon: <FiMapPin />, title: 'Địa chỉ', key: 'contact_address' as keyof ContactData },
    { icon: <FiPhone />, title: 'Điện thoại', key: 'contact_phone' as keyof ContactData },
    { icon: <FiMail />, title: 'Email', key: 'contact_email' as keyof ContactData },
    { icon: <FiClock />, title: 'Giờ mở cửa', key: 'contact_hours' as keyof ContactData },
  ];

  return (
    <>
      <div className="page-header" style={{ position: 'relative' }}>
        <button
          onClick={() => router.push('/m')}
          style={{
            position: 'absolute', top: 16, left: 16,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '1.1rem', color: 'var(--neutral-700)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10,
          }}
        >
          <FiArrowLeft />
        </button>
        <div className="container">
          <h1>Liên hệ</h1>
          <p>Chúng tôi luôn sẵn sàng lắng nghe bạn</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ gap: '48px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2>Thông tin liên hệ</h2>
                {isAdmin && !editing && (
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 8,
                      background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                      color: '#fff', border: 'none', fontSize: '0.85rem',
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <FiEdit2 /> Chỉnh sửa
                  </button>
                )}
                {isAdmin && editing && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '8px 14px', borderRadius: 8,
                        background: '#22c55e', color: '#fff', border: 'none',
                        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                        opacity: saving ? 0.6 : 1,
                      }}
                    >
                      <FiCheck /> {saving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button
                      onClick={() => { setForm(data); setEditing(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '8px 14px', borderRadius: 8,
                        background: '#ef4444', color: '#fff', border: 'none',
                        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <FiX /> Hủy
                    </button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div className="stat-icon purple" style={{ width: '44px', height: '44px', flexShrink: 0, fontSize: '1.1rem' }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.title}</div>
                      {editing ? (
                        <input
                          value={form[item.key]}
                          onChange={e => setForm({ ...form, [item.key]: e.target.value })}
                          style={{
                            width: '100%', padding: '8px 12px', borderRadius: 8,
                            border: '1.5px solid var(--neutral-200)', fontSize: '0.9rem',
                            fontFamily: 'inherit', outline: 'none',
                          }}
                          placeholder={`Nhập ${item.title.toLowerCase()}`}
                        />
                      ) : (
                        <div style={{ color: 'var(--neutral-500)' }}>
                          {data[item.key] || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Chưa cập nhật</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 style={{ marginBottom: '24px' }}>Gửi tin nhắn</h2>
              <form>
                <div className="form-group">
                  <label className="form-label">Họ tên</label>
                  <input type="text" className="form-input" placeholder="Nhập họ tên của bạn" />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input type="tel" className="form-input" placeholder="Nhập số điện thoại" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="Nhập email" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nội dung</label>
                  <textarea className="form-textarea" placeholder="Nhập nội dung tin nhắn..." rows={4}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Gửi tin nhắn</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
