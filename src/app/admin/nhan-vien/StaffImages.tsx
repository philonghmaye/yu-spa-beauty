'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiPlus, FiTrash2, FiImage, FiX } from 'react-icons/fi';
import { addStaffImage, removeStaffImage } from '@/actions/staff';
import toast from 'react-hot-toast';

interface ImageInfo { id: string; url: string; sortOrder: number }

export default function StaffImages({ employeeId, images }: { employeeId: string; images: ImageInfo[] }) {
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentImages, setCurrentImages] = useState(images);
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) {
          const newImage = await addStaffImage(employeeId, data.url);
          setCurrentImages(prev => [...prev, { id: newImage.id, url: data.url, sortOrder: prev.length }]);
        }
      }
      toast.success('Đã tải ảnh lên!');
    } catch {
      toast.error('Lỗi tải ảnh');
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (imageId: string) => {
    setDeleting(imageId);
    try {
      await removeStaffImage(imageId);
      setCurrentImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Đã xóa ảnh');
    } catch (err) {
      console.error('Delete image error:', err);
      toast.error('Lỗi xóa ảnh');
    }
    setDeleting(null);
  };

  const modal = showModal ? (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h3 className="modal-title">Quản lý ảnh nhân viên</h3>
          <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
        </div>

        {/* Upload Button */}
        <div style={{ marginBottom: 20 }}>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
          <button className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <FiPlus /> {uploading ? 'Đang tải...' : 'Thêm ảnh'}
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', marginLeft: 8 }}>
            {currentImages.length} ảnh
          </span>
        </div>

        {/* Image Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {currentImages.map(img => (
            <div key={img.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 'var(--radius-sm)', overflow: 'hidden', opacity: deleting === img.id ? 0.4 : 1 }}>
              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                disabled={deleting === img.id}
                style={{
                  position: 'absolute', top: 6, right: 6, width: 28, height: 28,
                  borderRadius: '50%', background: 'rgba(239,68,68,0.9)', color: '#fff',
                  border: 'none', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
                }}
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>

        {currentImages.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--neutral-400)' }}>
            <FiImage style={{ fontSize: '2rem', marginBottom: 8 }} /><br />
            Chưa có ảnh nào
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        className="btn btn-ghost btn-sm"
        style={{ padding: '4px 10px' }}
        onClick={() => setShowModal(true)}
        title="Quản lý ảnh"
      >
        <FiImage /> {currentImages.length > 0 && <span style={{ fontSize: '0.75rem' }}>{currentImages.length}</span>}
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
