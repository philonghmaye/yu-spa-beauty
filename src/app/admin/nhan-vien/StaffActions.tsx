'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiPlus, FiEdit2, FiUserX, FiUserCheck } from 'react-icons/fi';
import { createStaff, updateStaff, toggleStaffActive, updateStaffSkills } from '@/actions/staff';
import toast from 'react-hot-toast';

type ServiceInfo = { id: string; name: string; category: string };
type EmployeeInfo = {
  id: string; name: string; phone: string; email: string;
  position: string; bio: string; experience: number;
  isActive: boolean; skillIds: string[];
  schedules: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[];
};

interface Props {
  mode: 'header' | 'card-actions';
  allServices: ServiceInfo[];
  employee?: EmployeeInfo;
}

export default function StaffActions({ mode, allServices, employee }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const resetForm = () => {
    setName(''); setPhone(''); setEmail(''); setPassword('');
    setPosition(''); setBio(''); setExperience('');
    setSelectedSkills([]); setIsEditing(false);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = () => {
    if (!employee) return;
    setIsEditing(true);
    setName(employee.name); setPhone(employee.phone); setEmail(employee.email);
    setPosition(employee.position); setBio(employee.bio);
    setExperience(employee.experience?.toString() || '');
    setSelectedSkills(employee.skillIds);
    setShowModal(true);
  };

  const toggleSkill = (id: string) => {
    setSelectedSkills(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) { toast.error('Vui lòng nhập họ tên và SĐT'); return; }
    setLoading(true);
    try {
      if (isEditing && employee) {
        await updateStaff(employee.id, {
          name, phone, email, position, bio,
          experience: experience ? parseInt(experience) : undefined,
        });
        await updateStaffSkills(employee.id, selectedSkills);
        toast.success('Cập nhật thành công!');
      } else {
        if (!password || password.length < 6) { toast.error('Mật khẩu tối thiểu 6 ký tự'); setLoading(false); return; }
        await createStaff({
          name, phone, email, password, position, bio,
          experience: experience ? parseInt(experience) : undefined,
          skillServiceIds: selectedSkills,
        });
        toast.success('Thêm nhân viên thành công!');
      }
      setShowModal(false); resetForm();
    } catch (err) {
      toast.error('Có lỗi xảy ra');
      console.error(err);
    }
    setLoading(false);
  };

  const handleToggleActive = async () => {
    if (!employee) return;
    try {
      await toggleStaffActive(employee.id);
      toast.success(employee.isActive ? 'Đã cho nghỉ' : 'Đã kích hoạt');
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  // Group services by category for skill selection
  const servicesByCategory = allServices.reduce((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {} as Record<string, ServiceInfo[]>);

  const modalContent = showModal ? (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <h3 className="modal-title">{isEditing ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}</h3>
          <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Họ tên *</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">SĐT *</label>
              <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            {!isEditing && (
              <div className="form-group">
                <label className="form-label">Mật khẩu *</label>
                <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" />
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Vị trí</label>
              <input className="form-input" value={position} onChange={e => setPosition(e.target.value)} placeholder="VD: Chuyên viên da liễu" />
            </div>
            <div className="form-group">
              <label className="form-label">Kinh nghiệm (năm)</label>
              <input type="number" className="form-input" value={experience} onChange={e => setExperience(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Giới thiệu</label>
            <textarea className="form-textarea" value={bio} onChange={e => setBio(e.target.value)} rows={2} />
          </div>

          {/* Skills */}
          <div className="form-group">
            <label className="form-label">Kỹ năng dịch vụ</label>
            <div style={{ border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', padding: '12px', maxHeight: '200px', overflowY: 'auto' }}>
              {Object.entries(servicesByCategory).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--neutral-600)', marginBottom: '6px' }}>{cat}</div>
                  {items.map(s => (
                    <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedSkills.includes(s.id)} onChange={() => toggleSkill(s.id)} style={{ accentColor: 'var(--primary)' }} />
                      <span style={{ fontSize: '0.9rem' }}>{s.name}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm nhân viên')}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  // Use portal to render modal at document.body level (escapes card overflow:hidden)
  const portalModal = mounted && modalContent ? createPortal(modalContent, document.body) : null;

  if (mode === 'header') {
    return (
      <>
        <button className="btn btn-primary btn-sm" onClick={openCreate}><FiPlus /> Thêm nhân viên</button>
        {portalModal}
      </>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <span className={`badge ${employee?.isActive ? 'badge-success' : 'badge-error'}`}>
          {employee?.isActive ? 'Đang làm' : 'Nghỉ'}
        </span>
        <button className="btn btn-ghost btn-sm" style={{ padding: '4px 10px' }} onClick={openEdit}><FiEdit2 /></button>
        <button className="btn btn-ghost btn-sm" style={{ padding: '4px 10px', color: employee?.isActive ? 'var(--error)' : 'var(--success)' }} onClick={handleToggleActive}>
          {employee?.isActive ? <FiUserX /> : <FiUserCheck />}
        </button>
      </div>
      {portalModal}
    </>
  );
}
