'use client';

import { useState } from 'react';
import { FiClock, FiSave } from 'react-icons/fi';
import { updateBusinessHours } from '@/actions/settings';
import toast from 'react-hot-toast';

export default function SettingsForm({
  initialData,
}: {
  initialData: { openTime: string; closeTime: string; slotInterval: number };
}) {
  const [openTime, setOpenTime] = useState(initialData.openTime);
  const [closeTime, setCloseTime] = useState(initialData.closeTime);
  const [slotInterval, setSlotInterval] = useState(initialData.slotInterval);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    // Validation
    if (openTime >= closeTime) {
      toast.error('Giờ mở cửa phải trước giờ đóng cửa');
      return;
    }

    setSaving(true);
    try {
      await updateBusinessHours({ openTime, closeTime, slotInterval });
      toast.success('Đã lưu giờ làm việc!');
    } catch {
      toast.error('Lưu thất bại');
    }
    setSaving(false);
  };

  // Calculate total working hours
  const [oH, oM] = openTime.split(':').map(Number);
  const [cH, cM] = closeTime.split(':').map(Number);
  const totalMinutes = (cH * 60 + cM) - (oH * 60 + oM);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainMinutes = totalMinutes % 60;
  const totalSlots = Math.floor(totalMinutes / slotInterval);

  return (
    <div className="card" style={{ padding: '32px', maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FiClock /> Giờ làm việc
      </h2>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Giờ mở cửa</label>
          <input
            type="time"
            className="form-input"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Giờ đóng cửa</label>
          <input
            type="time"
            className="form-input"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label className="form-label">Khoảng cách giữa các khung giờ (phút)</label>
        <select
          className="form-input"
          value={slotInterval}
          onChange={(e) => setSlotInterval(parseInt(e.target.value, 10))}
        >
          <option value={15}>15 phút</option>
          <option value={30}>30 phút</option>
          <option value={45}>45 phút</option>
          <option value={60}>60 phút</option>
        </select>
      </div>

      {/* Preview */}
      {totalMinutes > 0 && (
        <div style={{
          background: 'var(--primary-50)', borderRadius: 'var(--radius)',
          padding: '16px', marginBottom: '24px', fontSize: '0.9rem',
        }}>
          <p><strong>Tổng thời gian làm việc:</strong> {totalHours} giờ {remainMinutes > 0 ? `${remainMinutes} phút` : ''}</p>
          <p><strong>Số khung giờ đặt lịch:</strong> {totalSlots} slots</p>
          <p style={{ color: 'var(--neutral-500)', marginTop: '4px', fontSize: '0.85rem' }}>
            Khách hàng sẽ chọn từ {openTime} đến {closeTime} (mỗi {slotInterval} phút)
          </p>
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving || totalMinutes <= 0}
      >
        <FiSave /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </div>
  );
}
