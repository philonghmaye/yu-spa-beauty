'use client';

import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { createPromotion, updatePromotion, togglePromotionActive, deletePromotion } from '@/actions/promotions';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

interface Promotion {
  id: string;
  name: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

type PromoForm = {
  name: string;
  code: string;
  description: string;
  type: string;
  value: string;
  minOrderValue: string;
  maxDiscount: string;
  usageLimit: string;
  startDate: string;
  endDate: string;
};

const emptyForm: PromoForm = {
  name: '', code: '', description: '', type: 'PERCENTAGE',
  value: '', minOrderValue: '', maxDiscount: '', usageLimit: '',
  startDate: '', endDate: '',
};

export default function PromotionActions({
  mode,
  promotion,
}: {
  mode: 'header' | 'row-actions' | 'toggle';
  promotion?: Promotion;
}) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<PromoForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = () => {
    if (!promotion) return;
    setForm({
      name: promotion.name,
      code: promotion.code,
      description: promotion.description || '',
      type: promotion.type,
      value: promotion.value.toString(),
      minOrderValue: promotion.minOrderValue?.toString() || '',
      maxDiscount: promotion.maxDiscount?.toString() || '',
      usageLimit: promotion.usageLimit?.toString() || '',
      startDate: new Date(promotion.startDate).toISOString().split('T')[0],
      endDate: new Date(promotion.endDate).toISOString().split('T')[0],
    });
    setEditId(promotion.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        name: form.name,
        code: form.code,
        description: form.description || undefined,
        type: form.type,
        value: parseFloat(form.value),
        minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : undefined,
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
        startDate: form.startDate,
        endDate: form.endDate,
      };

      if (editId) {
        await updatePromotion(editId, data);
        toast.success('Cập nhật khuyến mãi thành công');
      } else {
        await createPromotion(data);
        toast.success('Tạo khuyến mãi thành công');
      }
      setShowModal(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      toast.error(message);
    }
    setLoading(false);
  };

  const handleToggle = async () => {
    if (!promotion) return;
    try {
      await togglePromotionActive(promotion.id);
      toast.success(promotion.isActive ? 'Đã tắt khuyến mãi' : 'Đã bật khuyến mãi');
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleDelete = async () => {
    if (!promotion || !confirm('Bạn có chắc muốn xóa khuyến mãi này?')) return;
    try {
      await deletePromotion(promotion.id);
      toast.success('Đã xóa khuyến mãi');
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  if (mode === 'header') {
    return (
      <>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <FiPlus /> Thêm khuyến mãi
        </button>
        {showModal && typeof document !== 'undefined' && createPortal(
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="modal-header">
                <h3 className="modal-title">{editId ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Tên khuyến mãi *</label>
                    <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="VD: Giảm 20% tháng 5" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mã giảm giá *</label>
                    <input className="form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="VD: THANG5" disabled={!!editId} style={editId ? { opacity: 0.6 } : {}} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <input className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn" />
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Loại *</label>
                    <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      <option value="PERCENTAGE">Phần trăm (%)</option>
                      <option value="FIXED">Cố định (₫)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giá trị * {form.type === 'PERCENTAGE' ? '(%)' : '(₫)'}</label>
                    <input className="form-input" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required placeholder={form.type === 'PERCENTAGE' ? '20' : '50000'} />
                  </div>
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Đơn tối thiểu (₫)</label>
                    <input className="form-input" type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} placeholder="200000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giảm tối đa (₫)</label>
                    <input className="form-input" type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="100000" />
                  </div>
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Giới hạn lượt sử dụng</label>
                    <input className="form-input" type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="50" />
                  </div>
                  <div></div>
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Ngày bắt đầu *</label>
                    <input className="form-input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày kết thúc *</label>
                    <input className="form-input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Đang lưu...' : (editId ? 'Cập nhật' : 'Tạo mới')}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  if (mode === 'toggle') {
    return (
      <button className="btn btn-ghost btn-sm" onClick={handleToggle} title={promotion?.isActive ? 'Tắt' : 'Bật'} style={{ padding: '4px 10px' }}>
        {promotion?.isActive ? <FiToggleRight style={{ color: 'var(--success)', fontSize: '1.3rem' }} /> : <FiToggleLeft style={{ color: 'var(--neutral-400)', fontSize: '1.3rem' }} />}
      </button>
    );
  }

  // mode === 'row-actions'
  return (
    <>
      <div style={{ display: 'flex', gap: '4px' }}>
        <button className="btn btn-ghost btn-sm" style={{ padding: '4px 10px' }} onClick={openEdit} title="Sửa">
          <FiEdit2 />
        </button>
        <button className="btn btn-ghost btn-sm" style={{ padding: '4px 10px', color: 'var(--error)' }} onClick={handleDelete} title="Xóa">
          <FiTrash2 />
        </button>
      </div>
      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Sửa khuyến mãi</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Tên khuyến mãi *</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mã giảm giá</label>
                  <input className="form-input" value={form.code} disabled style={{ opacity: 0.6 }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <input className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Loại</label>
                  <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED">Cố định (₫)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Giá trị</label>
                  <input className="form-input" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Đơn tối thiểu</label>
                  <input className="form-input" type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Giảm tối đa</label>
                  <input className="form-input" type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Ngày bắt đầu</label>
                  <input className="form-input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày kết thúc</label>
                  <input className="form-input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
