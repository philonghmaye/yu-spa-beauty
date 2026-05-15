'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function MobileLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn('credentials', { login, password, redirect: false });
    if (result?.error) {
      toast.error('Sai thông tin đăng nhập');
    } else {
      toast.success('Đăng nhập thành công');
      router.push('/m');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="m-auth">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>✨</div>
        <h1><span style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>YURI SPA</span></h1>
        <p className="subtitle">Đăng nhập để đặt lịch nhanh hơn</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input className="form-input" style={{ borderRadius: 'var(--radius-full)', padding: '14px 20px' }} placeholder="Email hoặc SĐT" value={login} onChange={e => setLogin(e.target.value)} required />
        </div>
        <div className="form-group">
          <input className="form-input" style={{ borderRadius: 'var(--radius-full)', padding: '14px 20px' }} type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="m-btn-submit" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="auth-footer">
        Chưa có tài khoản? <Link href="/m/dang-ky" style={{ fontWeight: 600 }}>Đăng ký</Link>
      </div>
    </div>
  );
}
