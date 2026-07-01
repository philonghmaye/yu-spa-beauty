'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { resetPassword } from '@/actions/auth';
import { retrySavePushToken } from '@/lib/native';

export default function MobileLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotLogin, setForgotLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn('credentials', { login, password, redirect: false });
    if (result?.error) {
      toast.error('Sai thông tin đăng nhập');
    } else {
      toast.success('Đăng nhập thành công');
      // Gửi lại push token lên server (bây giờ đã đăng nhập)
      retrySavePushToken();
      // Check if user is admin
      try {
        const res = await fetch('/api/auth/role');
        const data = await res.json();
        if (data.role === 'ADMIN') {
          router.push('/m/admin');
        } else {
          router.push('/m');
        }
      } catch {
        router.push('/m');
      }
      router.refresh();
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotLogin.trim() || !newPassword.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setResetLoading(true);
    try {
      const result = await resetPassword({ login: forgotLogin.trim(), newPassword });
      if (result.success) {
        toast.success('Đặt lại mật khẩu thành công!');
        setShowForgot(false);
        setLogin(forgotLogin);
        setPassword('');
        setForgotLogin('');
        setNewPassword('');
      } else {
        toast.error(result.error || 'Có lỗi xảy ra');
      }
    } catch {
      toast.error('Có lỗi xảy ra');
    }
    setResetLoading(false);
  };

  return (
    <div className="m-auth">
      <Link
        href="/m"
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.8)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          color: 'var(--primary)',
          textDecoration: 'none',
          fontSize: '1.2rem',
          transition: 'background 0.2s, transform 0.2s',
          zIndex: 10,
        }}
        aria-label="Quay lại trang chủ"
      >
        ←
      </Link>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>✨</div>
        <h1><span style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>YURI SPA</span></h1>
        <p className="subtitle">
          {showForgot ? 'Đặt lại mật khẩu' : 'Đăng nhập để đặt lịch nhanh hơn'}
        </p>
      </div>

      {!showForgot ? (
        <>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input className="form-input" style={{ borderRadius: 'var(--radius-full)', padding: '14px 20px' }} placeholder="Email hoặc SĐT" value={login} onChange={e => setLogin(e.target.value)} required />
            </div>
            <div className="form-group">
              <input className="form-input" style={{ borderRadius: 'var(--radius-full)', padding: '14px 20px' }} type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div style={{ textAlign: 'right', marginBottom: 16, marginTop: -8 }}>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                style={{
                  background: 'none', border: 'none', color: 'var(--primary)',
                  fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                }}
              >
                Quên mật khẩu?
              </button>
            </div>
            <button type="submit" className="m-btn-submit" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="auth-footer">
            Chưa có tài khoản? <Link href="/m/dang-ky" style={{ fontWeight: 600 }}>Đăng ký</Link>
          </div>
        </>
      ) : (
        <>
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <input
                className="form-input"
                style={{ borderRadius: 'var(--radius-full)', padding: '14px 20px' }}
                placeholder="Email hoặc SĐT đã đăng ký"
                value={forgotLogin}
                onChange={e => setForgotLogin(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                className="form-input"
                style={{ borderRadius: 'var(--radius-full)', padding: '14px 20px' }}
                type="password"
                placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <button type="submit" className="m-btn-submit" disabled={resetLoading}>
              {resetLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>

          <div className="auth-footer">
            <button
              onClick={() => { setShowForgot(false); setForgotLogin(''); setNewPassword(''); }}
              style={{
                background: 'none', border: 'none', color: 'var(--primary)',
                fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              ← Quay lại đăng nhập
            </button>
          </div>
        </>
      )}
    </div>
  );
}
