'use client';

import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiEye, FiEyeOff } from 'react-icons/fi';
import { createService, updateService, toggleServiceActive, toggleServiceFeatured, deleteService } from '@/actions/services';
import { slugify, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

type Service = {
  id: string; name: string; slug: string; description: string | null;
  price: number; discountPrice: number | null; duration: number;
  image: string | null; isActive: boolean; isFeatured: boolean;
  categoryId: string; category: { id: string; name: string };
};

type Category = { id: string; name: string; slug: string; icon: string | null };

interface Props {
  services: Service[];
  categories: Category[];
  mode: 'header' | 'toggle-active' | 'toggle-featured' | 'row-actions';
  serviceId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  service?: Service;
}

export default function ServiceActions({ categories, mode, serviceId, isActive, isFeatured, service }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [serviceFeatured, setServiceFeatured] = useState(false);

  const resetForm = () => {
    setName(''); setCategoryId(''); setDescription('');
    setPrice(''); setDiscountPrice(''); setDuration('');
    setServiceFeatured(false); setEditingService(null);
  };

  const openCreateModal = () => {
    resetForm();
    if (categories.length > 0) setCategoryId(categories[0].id);
    setShowModal(true);
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setName(s.name);
    setCategoryId(s.categoryId);
    setDescription(s.description || '');
    setPrice(s.price.toString());
    setDiscountPrice(s.discountPrice?.toString() || '');
    setDuration(s.duration.toString());
    setServiceFeatured(s.isFeatured);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !price || !duration) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      if (editingService) {
        await updateService(editingService.id, {
          name, categoryId, description: description || undefined,
          price: parseFloat(price), discountPrice: discountPrice ? parseFloat(discountPrice) : null,
          duration: parseInt(duration), isFeatured: serviceFeatured,
        });
        toast.success('Cập nhật dịch vụ thành công!');
      } else {
        await createService({
          name, slug: slugify(name), categoryId, description: description || undefined,
          price: parseFloat(price), discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
          duration: parseInt(duration), isFeatured: serviceFeatured,
        });
        toast.success('Thêm dịch vụ thành công!');
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error('Có lỗi xảy ra');
      console.error(err);
    }
    setLoading(false);
  };

  const handleToggleActive = async () => {
    if (!serviceId) return;
    try {
      await toggleServiceActive(serviceId);
      toast.success(isActive ? 'Đã ẩn dịch vụ' : 'Đã hiện dịch vụ');
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleToggleFeatured = async () => {
    if (!serviceId) return;
    try {
      await toggleServiceFeatured(serviceId);
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;
    try {
      await deleteService(id);
      toast.success('Đã xóa dịch vụ');
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  // HEADER MODE: Show "Add" button
  if (mode === 'header') {
    return (
      <>
        <button className="btn btn-primary btn-sm" onClick={openCreateModal}><FiPlus /> Thêm dịch vụ</button>
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
              <div className="modal-header">
                <h3 className="modal-title">{editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Tên dịch vụ *</label>
                  <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="VD: Chăm sóc da mặt" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Danh mục *</label>
                  <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả ngắn về dịch vụ" rows={3} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Giá (VNĐ) *</label>
                    <input type="number" className="form-input" value={price} onChange={e => setPrice(e.target.value)} placeholder="350000" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giá KM</label>
                    <input type="number" className="form-input" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} placeholder="Tùy chọn" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Thời gian (phút) *</label>
                    <input type="number" className="form-input" value={duration} onChange={e => setDuration(e.target.value)} placeholder="60" required />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={serviceFeatured} onChange={e => setServiceFeatured(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                    <span style={{ fontWeight: 500 }}>⭐ Hiển thị nổi bật trên trang chủ</span>
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Đang lưu...' : (editingService ? 'Cập nhật' : 'Thêm dịch vụ')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // TOGGLE ACTIVE MODE
  if (mode === 'toggle-active') {
    return (
      <button className={`badge ${isActive ? 'badge-success' : 'badge-error'}`} onClick={handleToggleActive} style={{ cursor: 'pointer', border: 'none' }}>
        {isActive ? <><FiEye style={{ marginRight: '4px' }} />Hoạt động</> : <><FiEyeOff style={{ marginRight: '4px' }} />Tạm ẩn</>}
      </button>
    );
  }

  // TOGGLE FEATURED MODE
  if (mode === 'toggle-featured') {
    return (
      <button onClick={handleToggleFeatured} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
        {isFeatured ? '⭐' : '☆'}
      </button>
    );
  }

  // ROW ACTIONS MODE
  if (mode === 'row-actions' && service) {
    return (
      <>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }} onClick={() => openEditModal(service)}><FiEdit2 /></button>
          <button className="btn btn-ghost btn-sm" style={{ padding: '6px 10px', color: 'var(--error)' }} onClick={() => handleDelete(service.id)}><FiTrash2 /></button>
        </div>
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
              <div className="modal-header">
                <h3 className="modal-title">Sửa dịch vụ</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Tên dịch vụ *</label>
                  <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Danh mục *</label>
                  <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Giá (VNĐ) *</label>
                    <input type="number" className="form-input" value={price} onChange={e => setPrice(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giá KM</label>
                    <input type="number" className="form-input" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Thời gian (phút) *</label>
                    <input type="number" className="form-input" value={duration} onChange={e => setDuration(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={serviceFeatured} onChange={e => setServiceFeatured(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                    <span style={{ fontWeight: 500 }}>⭐ Nổi bật trên trang chủ</span>
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Đang lưu...' : 'Cập nhật'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
