'use client';

import { useState } from 'react';
import { FiCheck, FiX, FiPlay, FiCheckCircle, FiMessageSquare, FiTrash2 } from 'react-icons/fi';
import { updateAppointmentStatus, addStaffNote, deleteAppointment } from '@/actions/appointments';
import toast from 'react-hot-toast';

interface Props {
  appointment: { id: string; status: string; staffNote: string | null };
}

export default function AppointmentActions({ appointment }: Props) {
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState(appointment.staffNote || '');
  const [loading, setLoading] = useState(false);

  const handleStatus = async (status: string, label: string) => {
    setLoading(true);
    try {
      await updateAppointmentStatus(appointment.id, status);
      toast.success(`Đã ${label} lịch hẹn`);
    } catch { toast.error('Có lỗi xảy ra'); }
    setLoading(false);
  };

  const handleNote = async () => {
    try {
      await addStaffNote(appointment.id, note);
      toast.success('Đã lưu ghi chú');
      setShowNote(false);
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa lịch hẹn này?')) return;
    try {
      await deleteAppointment(appointment.id);
      toast.success('Đã xóa lịch hẹn');
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {appointment.status === 'PENDING' && (
          <>
            <button className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => handleStatus('CONFIRMED', 'xác nhận')} disabled={loading}>
              <FiCheck /> Xác nhận
            </button>
            <button className="btn btn-ghost btn-sm" style={{ padding: '4px 10px', fontSize: '0.78rem', color: 'var(--error)' }} onClick={() => handleStatus('CANCELLED', 'hủy')} disabled={loading}>
              <FiX /> Hủy
            </button>
          </>
        )}
        {appointment.status === 'CONFIRMED' && (
          <>
            <button className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: '0.78rem', background: 'var(--accent)' }} onClick={() => handleStatus('IN_PROGRESS', 'bắt đầu')} disabled={loading}>
              <FiPlay /> Bắt đầu
            </button>
            <button className="btn btn-ghost btn-sm" style={{ padding: '4px 10px', fontSize: '0.78rem', color: 'var(--error)' }} onClick={() => handleStatus('CANCELLED', 'hủy')} disabled={loading}>
              <FiX />
            </button>
          </>
        )}
        {appointment.status === 'IN_PROGRESS' && (
          <button className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: '0.78rem', background: 'var(--success)' }} onClick={() => handleStatus('COMPLETED', 'hoàn thành')} disabled={loading}>
            <FiCheckCircle /> Hoàn thành
          </button>
        )}
        <button className="btn btn-ghost btn-sm" style={{ padding: '4px 10px' }} onClick={() => setShowNote(!showNote)} title="Ghi chú">
          <FiMessageSquare />
        </button>
        {(appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') && (
          <button className="btn btn-ghost btn-sm" style={{ padding: '4px 10px', color: 'var(--error)' }} onClick={handleDelete} title="Xóa">
            <FiTrash2 />
          </button>
        )}
      </div>

      {showNote && (
        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
          <input className="form-input" value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú nội bộ..." style={{ padding: '6px 10px', fontSize: '0.85rem' }} />
          <button className="btn btn-primary btn-sm" style={{ padding: '6px 12px' }} onClick={handleNote}>Lưu</button>
        </div>
      )}
    </>
  );
}
