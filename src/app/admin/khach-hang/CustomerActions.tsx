'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiEdit2, FiSearch, FiTrash2 } from 'react-icons/fi';
import { updateCustomerNotes, updateCustomerLevel, deleteCustomer } from '@/actions/customers';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const levelLabels: Record<string, string> = { STANDARD: 'Thường', SILVER: 'Bạc', GOLD: 'Vàng', VIP: 'VIP' };
const levels = ['STANDARD', 'SILVER', 'GOLD', 'VIP'];

interface Props {
  mode?: 'search' | 'level' | 'actions';
  customerId?: string;
  currentLevel?: string;
  currentNotes?: string;
  customerName?: string;
}

export default function CustomerActions({ mode, customerId, currentLevel, currentNotes, customerName }: Props) {
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState(currentNotes || '');
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/admin/khach-hang?search=${encodeURIComponent(search)}`);
    } else {
      router.push('/admin/khach-hang');
    }
  };

  const handleLevel = async (level: string) => {
    if (!customerId) return;
    try {
      await updateCustomerLevel(customerId, level);
      toast.success(`Đã đổi hạng thành ${levelLabels[level]}`);
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleSaveNote = async () => {
    if (!customerId) return;
    try {
      await updateCustomerNotes(customerId, note);
      toast.success('Đã lưu ghi chú');
      setShowNote(false);
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleDelete = async () => {
    if (!customerId) return;
    if (!confirm(`Bạn có chắc muốn xóa khách hàng "${customerName}"? Hành động này không thể hoàn tác.`)) return;
    setDeleting(true);
    try {
      await deleteCustomer(customerId);
      toast.success('Đã xóa khách hàng');
    } catch {
      toast.error('Không thể xóa (khách hàng có lịch hẹn)');
    }
    setDeleting(false);
  };

  // Default: search bar
  if (!mode) {
    return (
      <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
          <input type="text" className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, SĐT, email..." style={{ paddingLeft: '40px' }} />
        </div>
      </form>
    );
  }

  // Level selector
  if (mode === 'level') {
    return (
      <select
        className="form-select"
        value={currentLevel}
        onChange={e => handleLevel(e.target.value)}
        style={{
          padding: '4px 24px 4px 8px', fontSize: '0.8rem', fontWeight: 600,
          borderRadius: 'var(--radius-full)', width: 'auto', minWidth: '80px',
          border: '1px solid var(--neutral-200)',
        }}
      >
        {levels.map(l => <option key={l} value={l}>{levelLabels[l]}</option>)}
      </select>
    );
  }

  // Row actions
  if (mode === 'actions') {
    const modalContent = showNote ? (
      <div className="modal-overlay" onClick={() => setShowNote(false)}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
          <div className="modal-header">
            <h3 className="modal-title">Ghi chú - {customerName}</h3>
            <button className="modal-close" onClick={() => setShowNote(false)}>×</button>
          </div>
          <div className="form-group">
            <textarea className="form-textarea" value={note} onChange={e => setNote(e.target.value)} rows={4} placeholder="Ghi chú về khách hàng (sở thích, dị ứng, yêu cầu đặc biệt...)" />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setShowNote(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleSaveNote}>Lưu ghi chú</button>
          </div>
        </div>
      </div>
    ) : null;

    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        <button className="btn btn-ghost btn-sm" style={{ padding: '4px 10px' }} onClick={() => setShowNote(!showNote)} title="Ghi chú">
          <FiEdit2 />
        </button>
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: '4px 10px', color: 'var(--error)' }}
          onClick={handleDelete}
          disabled={deleting}
          title="Xóa khách hàng"
        >
          <FiTrash2 />
        </button>
        {mounted && modalContent ? createPortal(modalContent, document.body) : null}
      </div>
    );
  }

  return null;
}
