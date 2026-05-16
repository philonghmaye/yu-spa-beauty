'use client';

import { useState } from 'react';
import { updateAppointmentStatus } from '@/actions/appointments';
import toast from 'react-hot-toast';

const statusFlow: Record<string, { next: string; label: string; color: string }[]> = {
  PENDING: [
    { next: 'CONFIRMED', label: 'Xác nhận', color: '#3b82f6' },
    { next: 'CANCELLED', label: 'Hủy', color: '#ef4444' },
  ],
  CONFIRMED: [
    { next: 'IN_PROGRESS', label: 'Bắt đầu', color: '#8b5cf6' },
    { next: 'CANCELLED', label: 'Hủy', color: '#ef4444' },
  ],
  IN_PROGRESS: [
    { next: 'COMPLETED', label: 'Hoàn thành', color: '#22c55e' },
  ],
  COMPLETED: [],
  CANCELLED: [],
};

export default function AppointmentActions({ appointmentId, currentStatus }: { appointmentId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const actions = statusFlow[currentStatus] || [];

  if (actions.length === 0) return null;

  const handleAction = async (newStatus: string) => {
    setLoading(true);
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      toast.success('Đã cập nhật!');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {actions.map((action) => (
        <button
          key={action.next}
          onClick={() => handleAction(action.next)}
          disabled={loading}
          style={{
            padding: '4px 12px', borderRadius: 8, border: 'none',
            background: `${action.color}15`, color: action.color,
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
