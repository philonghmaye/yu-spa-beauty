'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiLock, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { resetPassword } from '@/actions/auth';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: enter email/phone, 2: enter new password, 3: success
  const [login, setLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (!login.trim()) {
        toast.error('Vui lòng nhập email hoặc số điện thoại');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (newPassword.length < 6) {
        toast.error('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp');
        return;
      }

      setLoading(true);
      try {
        const result = await resetPassword({ login: login.trim(), newPassword });
        if (result.success) {
          setStep(3);
          toast.success('Đặt lại mật khẩu thành công!');
        } else {
          toast.error(result.error || 'Đặt lại mật khẩu thất bại');
        }
      } catch {
        toast.error('Đã có lỗi xảy ra');
      }
      setLoading(false);
    }
  };

  // Success state
  if (step === 3) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'var(--success-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: '2rem', color: 'var(--success)',
          }}>
            <FiCheck />
          </div>
          <h2 style={{ marginBottom: '12px' }}>Đặt lại mật khẩu thành công!</h2>
          <p style={{ color: 'var(--neutral-500)', marginBottom: '24px' }}>
            Bạn có thể đăng nhập bằng mật khẩu mới.
          </p>
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => router.push('/dang-nhap')}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h2><span>YURI SPA BEAUTY</span></h2>
          <p style={{ color: 'var(--neutral-500)', marginTop: '8px' }}>
            {step === 1 ? 'Quên mật khẩu' : 'Đặt mật khẩu mới'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <p style={{ fontSize: '0.9rem', color: 'var(--neutral-500)', marginBottom: '20px' }}>
                Nhập email hoặc số điện thoại đã đăng ký để đặt lại mật khẩu.
              </p>
              <div className="form-group">
                <label className="form-label">Email hoặc Số điện thoại</label>
                <input
                  type="text"
                  className="form-input"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Nhập email hoặc SĐT"
                  required
                  autoFocus
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p style={{ fontSize: '0.9rem', color: 'var(--neutral-500)', marginBottom: '20px' }}>
                Tài khoản: <strong>{login}</strong>
              </p>
              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  required
                  autoFocus
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  minLength={6}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            {step === 2 && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setStep(1)}
              >
                <FiArrowLeft /> Quay lại
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              <FiLock /> {loading ? 'Đang xử lý...' : step === 1 ? 'Tiếp tục' : 'Đặt lại mật khẩu'}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <Link href="/dang-nhap">← Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
