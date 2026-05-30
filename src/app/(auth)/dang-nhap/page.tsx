'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FiLogIn } from 'react-icons/fi';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', { login, password, redirect: false });
      if (res?.error) {
        setError('Email/SĐT hoặc mật khẩu không đúng');
      } else {
        // Check if user is admin to redirect appropriately
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
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
          <p style={{ color: 'var(--neutral-500)', marginTop: '8px' }}>Đăng nhập tài khoản</p>
        </div>
        {error && <div style={{ background: 'var(--error-light)', color: 'var(--error)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email hoặc Số điện thoại</label>
            <input type="text" className="form-input" value={login} onChange={e => setLogin(e.target.value)} placeholder="Nhập email hoặc SĐT" required />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nhập mật khẩu" required />
          </div>
          <div style={{ textAlign: 'right', marginBottom: '16px' }}>
            <Link href="/quen-mat-khau" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
              Quên mật khẩu?
            </Link>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            <FiLogIn /> {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <div className="auth-footer">
          Chưa có tài khoản? <Link href="/dang-ky">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
