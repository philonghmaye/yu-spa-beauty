'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiX, FiClock, FiStar, FiLoader } from 'react-icons/fi';
import { createBooking, validatePromoCode } from '@/actions/booking';
import toast from 'react-hot-toast';

interface BookingData {
  staffId: string;
  staffName: string;
  staffAvatar: string | null;
  staffRating: number;
  staffReviewCount: number;
  service: { id: string; name: string; price: number; duration: number };
}

interface TimeSlot { time: string; available: boolean }

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' đ';
}

export default function MobileBookingForm({
  userId, userInfo,
}: {
  userId?: string;
  userInfo?: { name: string; phone: string; email: string };
}) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discountAmount?: number; error?: string } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [customerName, setCustomerName] = useState(userInfo?.name || '');
  const [customerPhone, setCustomerPhone] = useState(userInfo?.phone || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('mobileBooking');
    if (data) {
      setBooking(JSON.parse(data));
    } else {
      router.push('/m');
    }
  }, [router]);

  const fetchSlots = useCallback(async () => {
    if (!selectedDate || !booking) return;
    setSlotsLoading(true);
    setSelectedTime('');
    try {
      const params = new URLSearchParams({
        date: selectedDate,
        duration: booking.service.duration.toString(),
        employeeId: booking.staffId,
      });
      const res = await fetch(`/api/booking/available-slots?${params}`);
      const data = await res.json();
      setTimeSlots(data.slots || []);
    } catch {
      setTimeSlots([]);
    }
    setSlotsLoading(false);
  }, [selectedDate, booking]);

  useEffect(() => { if (selectedDate) fetchSlots(); }, [selectedDate, fetchSlots]);

  const handlePromo = async () => {
    if (!promoCode.trim() || !booking) return;
    setPromoLoading(true);
    try {
      const result = await validatePromoCode(promoCode.trim(), booking.service.price);
      setPromoResult(result);
      if (result.valid) toast.success(`Giảm ${formatCurrency(result.discountAmount || 0)}`);
      else toast.error(result.error || 'Mã không hợp lệ');
    } catch { toast.error('Lỗi kiểm tra mã'); }
    setPromoLoading(false);
  };

  const handleSubmit = async () => {
    if (!booking || !selectedDate || !selectedTime || !customerName || !customerPhone) return;
    setSubmitting(true);
    try {
      const result = await createBooking({
        serviceIds: [booking.service.id],
        employeeId: booking.staffId,
        appointmentDate: selectedDate,
        startTime: selectedTime,
        customerName,
        customerPhone,
        customerEmail: userInfo?.email,
        promoCode: promoResult?.valid ? promoCode.trim() : undefined,
        userId,
      });

      // Handle MoMo payment
      if (paymentMethod === 'MOMO') {
        const momoRes = await fetch('/api/payment/momo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            orderId: `YURI-${result.id}-${Date.now()}`,
            orderInfo: `Đặt lịch ${booking.service.name} - YURI SPA BEAUTY`,
          }),
        });
        const momoData = await momoRes.json();
        if (momoData.payUrl) {
          sessionStorage.setItem('mobileBookingResult', JSON.stringify(result));
          sessionStorage.removeItem('mobileBooking');
          window.location.href = momoData.payUrl;
          return;
        } else {
          toast.error(momoData.error || 'Không thể kết nối MoMo');
          setSubmitting(false);
          return;
        }
      }

      sessionStorage.setItem('mobileBookingResult', JSON.stringify(result));
      sessionStorage.removeItem('mobileBooking');
      router.push('/m/dat-lich/ket-qua');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đặt lịch thất bại');
    }
    setSubmitting(false);
  };

  if (!booking) return <div style={{ padding: 40, textAlign: 'center' }}><FiLoader style={{ animation: 'spin 1s linear infinite', fontSize: '1.5rem' }} /></div>;

  const discount = promoResult?.valid ? (promoResult.discountAmount || 0) : 0;
  const total = Math.max(0, booking.service.price - discount);
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      {/* Top Bar */}
      <div className="m-topbar">
        <button className="m-topbar-back" onClick={() => router.back()}><FiArrowLeft /></button>
        <span className="m-topbar-title">Thông tin đặt lịch</span>
      </div>

      <div style={{ paddingBottom: 90 }}>
        {/* Customer Info (if not logged in) */}
        {!userInfo && (
          <div className="m-booking-section">
            <div className="m-booking-section-title">Thông tin của bạn</div>
            <div style={{ marginBottom: 10 }}>
              <input className="m-date-input" placeholder="Họ tên *" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            </div>
            <input className="m-date-input" placeholder="Số điện thoại *" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
          </div>
        )}

        {/* Selected Service */}
        <div className="m-booking-section">
          <div className="m-booking-service-card">
            <div className="info">
              <h3>{booking.service.name}</h3>
              <p><FiClock style={{ verticalAlign: 'middle' }} /> {booking.service.duration} phút | {formatCurrency(booking.service.price)}</p>
            </div>
            <button className="remove" onClick={() => { sessionStorage.removeItem('mobileBooking'); router.push('/m'); }}><FiX /></button>
          </div>
          {/* Staff */}
          <div className="m-booking-staff">
            <div className="m-booking-staff-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '1rem' }}>
              {booking.staffAvatar ? <img src={booking.staffAvatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : booking.staffName.charAt(0)}
            </div>
            <div>
              <div className="name">{booking.staffName}</div>
              <div className="rating"><span style={{ color: 'var(--gold)' }}>★</span> {booking.staffRating} ({booking.staffReviewCount} đánh giá)</div>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="m-booking-section">
          <div className="m-booking-section-title">Chọn ngày & giờ</div>
          <input type="date" className="m-date-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={today} />
          {selectedDate && (
            <div style={{ marginTop: 12 }}>
              {slotsLoading ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--neutral-400)' }}>Đang tải...</div>
              ) : timeSlots.length > 0 ? (
                <div className="m-time-grid">
                  {timeSlots.map(t => (
                    <div key={t.time} className={`m-time-slot ${selectedTime === t.time ? 'selected' : ''} ${!t.available ? 'unavailable' : ''}`} onClick={() => t.available && setSelectedTime(t.time)}>
                      {t.time}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--neutral-400)', padding: 20 }}>Không có khung giờ</p>
              )}
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="m-booking-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="m-booking-section-title" style={{ marginBottom: 0 }}>Phương thức thanh toán</div>
          </div>
          <div className={`m-payment-option ${paymentMethod === 'CASH' ? 'active' : ''}`} onClick={() => setPaymentMethod('CASH')}>
            <div className="icon">💰</div>
            <div className="label">Tiền mặt</div>
            <div className="radio" />
          </div>
          <div className={`m-payment-option ${paymentMethod === 'MOMO' ? 'active' : ''}`} onClick={() => setPaymentMethod('MOMO')}>
            <div className="icon" style={{ background: '#ae2070', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>M</div>
            <div className="label">Ví MoMo</div>
            <div className="radio" />
          </div>
          <div className={`m-payment-option ${paymentMethod === 'VNPAY' ? 'active' : ''}`} onClick={() => setPaymentMethod('VNPAY')}>
            <div className="icon">💳</div>
            <div className="label">VNPay</div>
            <div className="radio" />
          </div>
        </div>

        {/* Promo Code */}
        <div className="m-booking-section">
          <div className="m-booking-section-title">Mã giảm giá</div>
          <div className="m-promo-input">
            <input placeholder="Nhập mã giảm giá" value={promoCode} onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); }} />
            <button onClick={handlePromo} disabled={!promoCode.trim() || promoLoading}>
              {promoLoading ? '...' : 'Áp dụng'}
            </button>
          </div>
          {promoResult && (
            <p style={{ marginTop: 8, fontSize: '0.82rem', color: promoResult.valid ? 'var(--success)' : 'var(--error)' }}>
              {promoResult.valid ? `✅ Giảm ${formatCurrency(promoResult.discountAmount || 0)}` : `❌ ${promoResult.error}`}
            </p>
          )}
        </div>

        {/* Price Summary */}
        <div className="m-booking-section">
          <div className="m-booking-section-title">Chi tiết thanh toán</div>
          <div className="m-price-row">
            <span>Tạm tính</span>
            <span>{formatCurrency(booking.service.price)}</span>
          </div>
          {discount > 0 && (
            <div className="m-price-row" style={{ color: 'var(--accent)' }}>
              <span>Giảm giá</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="m-price-row total">
            <span>Tổng: 1 dịch vụ</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Submit Bar */}
      <div className="m-bottom-bar" style={{ flexDirection: 'column', gap: 0 }}>
        <button
          className="m-btn-submit"
          disabled={!selectedDate || !selectedTime || !customerName || !customerPhone || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Đang xử lý...' : 'Đặt ngay'}
        </button>
      </div>
    </>
  );
}
