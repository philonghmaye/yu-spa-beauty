'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUserPlus } from 'react-icons/fi';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Đăng ký thất bại');
      } else {
        router.push('/dang-nhap?registered=true');
      }
    } catch {
      setError('Đã có lỗi xảy ra');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h2><span>YURI SPA BEAUTY</span></h2>
          <p style={{ color: 'var(--neutral-500)', marginTop: '8px' }}>Tạo tài khoản mới</p>
        </div>
        {error && <div style={{ background: 'var(--error-light)', color: 'var(--error)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Họ tên *</label>
            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Nhập họ tên" required />
          </div>
          <div className="form-group">
            <label className="form-label">Số điện thoại *</label>
            <input type="tel" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Nhập số điện thoại" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="Nhập email (tùy chọn)" />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu *</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            <FiUserPlus /> {loading ? 'Đang tạo...' : 'Đăng ký'}
          </button>
        </form>
        <div className="auth-footer">
          Đã có tài khoản? <Link href="/dang-nhap">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
