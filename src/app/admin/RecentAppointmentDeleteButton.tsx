'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import { deleteAppointment } from '@/actions/appointments';

interface Props {
  appointmentId: string;
}

export default function RecentAppointmentDeleteButton({ appointmentId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa lịch hẹn này khỏi lịch sử gần đây?')) return;

    setLoading(true);
    try {
      await deleteAppointment(appointmentId);
      toast.success('Đã xóa lịch hẹn');
      router.refresh();
    } catch {
      toast.error('Có lỗi xảy ra khi xóa lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      style={{ padding: '6px 10px', color: 'var(--error)' }}
      onClick={handleDelete}
      disabled={loading}
      title="Xóa lịch hẹn"
      aria-label="Xóa lịch hẹn"
    >
      <FiTrash2 />
    </button>
  );
}
