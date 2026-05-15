'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiCheck } from 'react-icons/fi';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' đ';
}

export default function BookingResultPage() {
  const [result, setResult] = useState<{
    id: string; appointmentDate: string; startTime: string; endTime: string;
    services: string[]; employeeName: string | null;
    totalAmount: number; discountAmount: number; finalAmount: number;
  } | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('mobileBookingResult');
    if (data) setResult(JSON.parse(data));
  }, []);

  if (!result) return (
    <div className="m-success">
      <p>Không có thông tin đặt lịch</p>
      <Link href="/m" className="m-btn-book" style={{ marginTop: 16, display: 'inline-block', padding: '10px 28px' }}>Về trang chủ</Link>
    </div>
  );

  return (
    <div className="m-success">
      <div className="m-success-icon"><FiCheck /></div>
      <h2 style={{ marginBottom: 8 }}>Đặt lịch thành công!</h2>
      <p style={{ color: 'var(--neutral-500)', marginBottom: 24, fontSize: '0.9rem' }}>
        Chúng tôi sẽ xác nhận lịch hẹn sớm nhất.
      </p>
      <div style={{ width: '100%', background: 'var(--primary-50)', borderRadius: 'var(--radius)', padding: 20, textAlign: 'left', marginBottom: 24 }}>
        <p><strong>Dịch vụ:</strong> {result.services.join(', ')}</p>
        <p><strong>Nhân viên:</strong> {result.employeeName || 'Bất kỳ'}</p>
        <p><strong>Ngày:</strong> {result.appointmentDate}</p>
        <p><strong>Giờ:</strong> {result.startTime} — {result.endTime}</p>
        {result.discountAmount > 0 && (
          <p style={{ color: 'var(--accent)' }}><strong>Giảm giá:</strong> -{formatCurrency(result.discountAmount)}</p>
        )}
        <p style={{ fontSize: '1.1rem', marginTop: 8 }}>
          <strong>Tổng: <span style={{ color: 'var(--primary)' }}>{formatCurrency(result.finalAmount)}</span></strong>
        </p>
      </div>
      <Link href="/m" className="m-btn-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', maxWidth: 300 }}>
        Về trang chủ
      </Link>
    </div>
  );
}
