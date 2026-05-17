'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiCheck, FiClock, FiUser, FiCalendar, FiFileText, FiTag, FiLoader } from 'react-icons/fi';
import { createBooking, validatePromoCode } from '@/actions/booking';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  duration: number;
  image: string | null;
  category: { id: string; name: string; slug: string; icon: string | null };
}

interface Staff {
  id: string;
  user: { name: string; avatar: string | null };
  skills: { service: { id: string; name: string } }[];
  schedules: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[];
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface BookingResult {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  services: string[];
  employeeName: string | null;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  promoCode: string | null;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

export default function BookingForm({
  services,
  staff,
  userId,
  userInfo,
}: {
  services: Service[];
  staff: Staff[];
  userId?: string;
  userInfo?: { name: string; phone: string; email: string };
}) {
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState(userInfo?.name || '');
  const [customerPhone, setCustomerPhone] = useState(userInfo?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(userInfo?.email || '');
  const [customerNote, setCustomerNote] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discountAmount?: number; promoName?: string; error?: string } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const toggleService = (id: string) => {
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const selectedServiceDetails = services.filter((s) => selectedServices.includes(s.id));
  const totalPrice = selectedServiceDetails.reduce((sum, s) => sum + (s.discountPrice || s.price), 0);
  const totalDuration = selectedServiceDetails.reduce((sum, s) => sum + s.duration, 0);
  const discountAmount = promoResult?.valid ? (promoResult.discountAmount || 0) : 0;
  const finalPrice = Math.max(0, totalPrice - discountAmount);

  // Group services by category
  const servicesByCategory = services.reduce((acc, s) => {
    const catName = s.category.name;
    if (!acc[catName]) acc[catName] = { icon: s.category.icon, services: [] };
    acc[catName].services.push(s);
    return acc;
  }, {} as Record<string, { icon: string | null; services: Service[] }>);

  // Filter staff based on selected services
  const availableStaff = staff.filter((s) => {
    if (selectedServices.length === 0) return true;
    // Staff must have skills for at least one selected service
    return selectedServices.some((serviceId) =>
      s.skills.some((skill) => skill.service.id === serviceId)
    );
  });

  // Fetch available slots when date or staff changes
  const fetchSlots = useCallback(async () => {
    if (!selectedDate || totalDuration === 0) return;
    setSlotsLoading(true);
    setSelectedTime('');
    try {
      const params = new URLSearchParams({
        date: selectedDate,
        duration: totalDuration.toString(),
      });
      if (selectedStaff !== 'any') {
        params.set('employeeId', selectedStaff);
      }
      const res = await fetch(`/api/booking/available-slots?${params}`);
      const data = await res.json();
      setTimeSlots(data.slots || []);
    } catch {
      toast.error('Không thể tải khung giờ');
      setTimeSlots([]);
    }
    setSlotsLoading(false);
  }, [selectedDate, selectedStaff, totalDuration]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate, selectedStaff, fetchSlots]);

  // Validate promo code
  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const result = await validatePromoCode(promoCode.trim(), totalPrice);
      setPromoResult(result);
      if (result.valid) {
        toast.success(`Áp dụng mã thành công! Giảm ${formatCurrency(result.discountAmount || 0)}`);
      } else {
        toast.error(result.error || 'Mã không hợp lệ');
      }
    } catch {
      toast.error('Không thể kiểm tra mã giảm giá');
    }
    setPromoLoading(false);
  };

  const canNext = () => {
    if (step === 1) return selectedServices.length > 0;
    if (step === 2) return true;
    if (step === 3) return selectedDate && selectedTime;
    if (step === 4) return customerName && customerPhone;
    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await createBooking({
        serviceIds: selectedServices,
        employeeId: selectedStaff === 'any' ? null : selectedStaff,
        appointmentDate: selectedDate,
        startTime: selectedTime,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        customerNote: customerNote || undefined,
        promoCode: promoResult?.valid ? promoCode.trim() : undefined,
        userId,
      });
      setBookingResult(result);
      toast.success('Đặt lịch thành công!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đặt lịch thất bại';
      toast.error(message);
    }
    setSubmitting(false);
  };

  // ============ SUCCESS PAGE ============
  if (bookingResult) {
    return (
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center', paddingTop: '20px' }}>
        <div className="card" style={{ padding: '48px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'var(--success-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: '2rem', color: 'var(--success)',
          }}>
            <FiCheck />
          </div>
          <h2 style={{ marginBottom: '12px' }}>Đặt lịch thành công!</h2>
          <p style={{ color: 'var(--neutral-500)', marginBottom: '24px', fontSize: '0.95rem' }}>
            Chúng tôi sẽ xác nhận lịch hẹn của bạn trong thời gian sớm nhất qua Zalo hoặc điện thoại.
          </p>
          <div style={{
            background: 'var(--primary-50)', borderRadius: 'var(--radius)',
            padding: '20px', textAlign: 'left', marginBottom: '24px',
          }}>
            <p><strong>Dịch vụ:</strong> {bookingResult.services.join(', ')}</p>
            <p><strong>Nhân viên:</strong> {bookingResult.employeeName || 'Bất kỳ nhân viên'}</p>
            <p><strong>Ngày:</strong> {bookingResult.appointmentDate}</p>
            <p><strong>Giờ:</strong> {bookingResult.startTime} — {bookingResult.endTime}</p>
            {bookingResult.discountAmount > 0 && (
              <>
                <p><strong>Tạm tính:</strong> {formatCurrency(bookingResult.totalAmount)}</p>
                <p style={{ color: 'var(--accent)' }}>
                  <strong>Giảm giá ({bookingResult.promoCode}):</strong> -{formatCurrency(bookingResult.discountAmount)}
                </p>
              </>
            )}
            <p style={{ fontSize: '1.1rem', marginTop: '8px' }}>
              <strong>Tổng tiền: <span style={{ color: 'var(--primary)' }}>{formatCurrency(bookingResult.finalAmount)}</span></strong>
            </p>
          </div>
          <a href="/" className="btn btn-primary">Về trang chủ</a>
        </div>
      </div>
    );
  }

  // ============ BOOKING FORM ============
  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      {/* Steps indicator */}
      <div className="booking-steps">
        {[
          { num: 1, label: 'Dịch vụ' },
          { num: 2, label: 'Nhân viên' },
          { num: 3, label: 'Thời gian' },
          { num: 4, label: 'Thông tin' },
        ].map((s) => (
          <div
            key={s.num}
            className={`booking-step ${step === s.num ? 'active' : step > s.num ? 'done' : ''}`}
          >
            <span className="booking-step-num">{step > s.num ? '✓' : s.num}</span> {s.label}
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '32px' }}>
        {/* Step 1: Select Services */}
        {step === 1 && (
          <div>
            <h2 style={{ marginBottom: '24px' }}>Chọn dịch vụ</h2>
            {Object.entries(servicesByCategory).map(([catName, { icon, services: catServices }]) => (
              <div key={catName} style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--neutral-600)', marginBottom: '12px' }}>
                  {icon} {catName}
                </h3>
                {catServices.map((s) => (
                  <label
                    key={s.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px',
                      border: `2px solid ${selectedServices.includes(s.id) ? 'var(--primary)' : 'var(--neutral-200)'}`,
                      borderRadius: 'var(--radius-sm)', marginBottom: '8px',
                      cursor: 'pointer',
                      background: selectedServices.includes(s.id) ? 'var(--primary-50)' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(s.id)}
                      onChange={() => toggleService(s.id)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{s.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
                        <FiClock style={{ verticalAlign: 'middle', marginRight: '4px' }} />{s.duration} phút
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--primary)', textAlign: 'right' }}>
                      {s.discountPrice ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: 'var(--neutral-400)', fontSize: '0.8rem', display: 'block' }}>
                            {formatCurrency(s.price)}
                          </span>
                          {formatCurrency(s.discountPrice)}
                        </>
                      ) : (
                        formatCurrency(s.price)
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Select Staff */}
        {step === 2 && (
          <div>
            <h2 style={{ marginBottom: '24px' }}>Chọn nhân viên (tùy chọn)</h2>
            <div className="grid grid-2">
              <label
                className="card"
                style={{
                  cursor: 'pointer', textAlign: 'center', padding: '24px',
                  border: `2px solid ${selectedStaff === 'any' ? 'var(--primary)' : 'var(--neutral-200)'}`,
                  background: selectedStaff === 'any' ? 'var(--primary-50)' : 'var(--white)',
                }}
              >
                <input type="radio" name="staff" value="any" checked={selectedStaff === 'any'} onChange={() => setSelectedStaff('any')} style={{ display: 'none' }} />
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--primary-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px', fontSize: '1.3rem', color: 'var(--primary)',
                }}>
                  <FiUser />
                </div>
                <div style={{ fontWeight: 600 }}>Bất kỳ nhân viên</div>
              </label>
              {availableStaff.map((s) => (
                <label
                  key={s.id}
                  className="card"
                  style={{
                    cursor: 'pointer', textAlign: 'center', padding: '24px',
                    border: `2px solid ${selectedStaff === s.id ? 'var(--primary)' : 'var(--neutral-200)'}`,
                    background: selectedStaff === s.id ? 'var(--primary-50)' : 'var(--white)',
                  }}
                >
                  <input type="radio" name="staff" value={s.id} checked={selectedStaff === s.id} onChange={() => setSelectedStaff(s.id)} style={{ display: 'none' }} />
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'var(--primary-light)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px', fontSize: '1.3rem', color: 'var(--primary)',
                    overflow: 'hidden',
                  }}>
                    {s.user.avatar ? (
                      <img src={s.user.avatar} alt={s.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <FiUser />
                    )}
                  </div>
                  <div style={{ fontWeight: 600 }}>{s.user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', marginTop: '4px' }}>
                    {s.skills.slice(0, 3).map((sk) => sk.service.name).join(', ')}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 3 && (
          <div>
            <h2 style={{ marginBottom: '24px' }}>Chọn ngày và giờ</h2>
            <div className="form-group">
              <label className="form-label">Chọn ngày</label>
              <input
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {selectedDate && (
              <div>
                <label className="form-label">
                  Chọn giờ
                  {slotsLoading && <FiLoader style={{ marginLeft: '8px', animation: 'spin 1s linear infinite' }} />}
                </label>
                {slotsLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-400)' }}>
                    Đang tải khung giờ...
                  </div>
                ) : (
                  <div className="time-slots">
                    {timeSlots.map((t) => (
                      <div
                        key={t.time}
                        className={`time-slot ${selectedTime === t.time ? 'selected' : ''} ${!t.available ? 'unavailable' : ''}`}
                        onClick={() => t.available && setSelectedTime(t.time)}
                      >
                        {t.time}
                      </div>
                    ))}
                  </div>
                )}
                {!slotsLoading && timeSlots.length > 0 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', marginTop: '12px' }}>
                    ⏱ Thời gian ước tính: {totalDuration} phút
                    {selectedTime && ` • Kết thúc lúc ~${calculateEndTime(selectedTime, totalDuration)}`}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Customer Info */}
        {step === 4 && (
          <div>
            <h2 style={{ marginBottom: '24px' }}>Thông tin của bạn</h2>

            {userInfo && (
              <div style={{
                background: 'var(--success-light)', borderRadius: 'var(--radius-sm)',
                padding: '12px 16px', marginBottom: '20px', fontSize: '0.88rem',
                color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <FiCheck />
                Thông tin đã được điền tự động từ tài khoản. Bạn có thể chỉnh sửa nếu cần.
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Họ tên *</label>
              <input type="text" className="form-input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nhập họ tên" />
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại *</label>
              <input type="tel" className="form-input" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Nhập số điện thoại" />
            </div>
            <div className="form-group">
              <label className="form-label">Email (nhận xác nhận)</label>
              <input type="email" className="form-input" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Nhập email (tùy chọn)" />
            </div>
            <div className="form-group">
              <label className="form-label">Ghi chú</label>
              <textarea className="form-textarea" value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} placeholder="Yêu cầu đặc biệt, dị ứng..." rows={3}></textarea>
            </div>

            {/* Promo Code */}
            <div className="form-group">
              <label className="form-label"><FiTag style={{ verticalAlign: 'middle', marginRight: '4px' }} />Mã giảm giá</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); }}
                  placeholder="Nhập mã giảm giá"
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleValidatePromo}
                  disabled={!promoCode.trim() || promoLoading}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {promoLoading ? 'Đang kiểm tra...' : 'Áp dụng'}
                </button>
              </div>
              {promoResult && (
                <div style={{
                  marginTop: '8px', padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  background: promoResult.valid ? 'var(--success-light)' : 'var(--error-light)',
                  color: promoResult.valid ? '#065f46' : '#991b1b',
                }}>
                  {promoResult.valid
                    ? `✅ ${promoResult.promoName} — Giảm ${formatCurrency(promoResult.discountAmount || 0)}`
                    : `❌ ${promoResult.error}`
                  }
                </div>
              )}
            </div>

            {/* Summary */}
            <div style={{ background: 'var(--primary-50)', borderRadius: 'var(--radius)', padding: '20px', marginTop: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Tóm tắt đặt lịch</h3>
              <p><strong>Dịch vụ:</strong> {selectedServiceDetails.map((s) => s.name).join(', ')}</p>
              <p><strong>Nhân viên:</strong> {selectedStaff === 'any' ? 'Bất kỳ nhân viên' : availableStaff.find((s) => s.id === selectedStaff)?.user.name}</p>
              <p><strong>Ngày:</strong> {selectedDate}</p>
              <p><strong>Giờ:</strong> {selectedTime} — ~{calculateEndTime(selectedTime, totalDuration)}</p>
              <p><strong>Thời gian:</strong> {totalDuration} phút</p>
              {discountAmount > 0 && (
                <>
                  <p><strong>Tạm tính:</strong> {formatCurrency(totalPrice)}</p>
                  <p style={{ color: 'var(--accent)' }}><strong>Giảm giá:</strong> -{formatCurrency(discountAmount)}</p>
                </>
              )}
              <p style={{ fontSize: '1.1rem', marginTop: '8px' }}>
                <strong>Tổng tiền: <span style={{ color: 'var(--primary)' }}>{formatCurrency(finalPrice)}</span></strong>
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--neutral-200)' }}>
          {step > 1 ? (
            <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>← Quay lại</button>
          ) : <div />}
          {step < 4 ? (
            <button className="btn btn-primary" disabled={!canNext()} onClick={() => setStep(step + 1)}>
              Tiếp tục →
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" disabled={!canNext() || submitting} onClick={handleSubmit}>
              <FiCalendar /> {submitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
            </button>
          )}
        </div>

        {/* Summary bar */}
        {selectedServices.length > 0 && step < 4 && (
          <div style={{
            marginTop: '20px', padding: '12px 16px',
            background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem',
          }}>
            <span>Đã chọn {selectedServices.length} dịch vụ • {totalDuration} phút</span>
            <strong style={{ color: 'var(--primary)' }}>{formatCurrency(totalPrice)}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  if (!startTime) return '';
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}
