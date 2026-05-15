'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function MobileRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !password) { toast.error('Vui lòng điền đầy đủ'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại');
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/m/dang-nhap');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đăng ký thất bại');
    }
    setLoading(false);
  };

  return (
    <div className="m-auth">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>✨</div>
        <h1><span style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>YURI SPA</span></h1>
        <p className="subtitle">Tạo tài khoản miễn phí</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input className="form-input" style={{ borderRadius: 'var(--radius-full)', padding: '14px 20px' }} placeholder="Họ tên *" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <input className="form-input" style={{ borderRadius: 'var(--radius-full)', padding: '14px 20px' }} placeholder="Số điện thoại *" value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>
        <div className="form-group">
          <input className="form-input" style={{ borderRadius: 'var(--radius-full)', padding: '14px 20px' }} type="email" placeholder="Email (tùy chọn)" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <input className="form-input" style={{ borderRadius: 'var(--radius-full)', padding: '14px 20px' }} type="password" placeholder="Mật khẩu *" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="m-btn-submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng ký'}
        </button>
      </form>

      <div className="auth-footer">
        Đã có tài khoản? <Link href="/m/dang-nhap" style={{ fontWeight: 600 }}>Đăng nhập</Link>
      </div>
    </div>
  );
}
