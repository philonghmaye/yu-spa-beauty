'use client';

import { useState, useRef } from 'react';
import { FiCamera, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Props {
  isAdmin: boolean;
  initialBanner: string | null;
}

export default function PromoBanner({ isAdmin, initialBanner }: Props) {
  const [bannerUrl, setBannerUrl] = useState<string | null>(initialBanner);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Compress image on client using canvas
  const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth; }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    setUploading(true);
    try {
      // Compress image client-side
      const dataUrl = await compressImage(file);

      // Save directly to settings API
      const res = await fetch('/api/settings/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: dataUrl }),
      });

      if (!res.ok) throw new Error('Save failed');

      setBannerUrl(dataUrl);
      toast.success('Cập nhật banner thành công!');
    } catch {
      toast.error('Có lỗi xảy ra khi upload');
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleRemove = async () => {
    try {
      await fetch('/api/settings/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: '' }),
      });
      setBannerUrl(null);
      toast.success('Đã xóa banner');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  // Banner with image
  if (bannerUrl) {
    return (
      <div style={{ margin: '0 16px 16px', position: 'relative' }}>
        <div style={{
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(124,58,237,0.12)',
        }}>
          <img
            src={bannerUrl}
            alt="Ưu đãi đặc biệt"
            style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                border: 'none', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Thay ảnh"
            >
              <FiCamera style={{ fontSize: '0.85rem' }} />
            </button>
            <button
              onClick={handleRemove}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(239,68,68,0.7)', backdropFilter: 'blur(4px)',
                border: 'none', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Xóa banner"
            >
              <FiX style={{ fontSize: '0.85rem' }} />
            </button>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
      </div>
    );
  }

  // Default text banner (no image uploaded)
  return (
    <div style={{ margin: '0 16px 16px', position: 'relative' }}>
      <div style={{
        padding: '20px 24px', borderRadius: 16,
        background: 'linear-gradient(135deg, #f3e8ff, #fce7f3, #e0e7ff)',
        border: '1px solid rgba(124,58,237,0.15)',
        boxShadow: '0 2px 12px rgba(124,58,237,0.08)',
        minHeight: 100, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
      }}>
        <div style={{ fontSize: '0.88rem', color: '#7c3aed', fontWeight: 600, marginBottom: 4 }}>
          🎉 Ưu đãi đặc biệt
        </div>
        <div style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.5 }}>
          Giảm <strong>20%</strong> cho lần đặt lịch đầu tiên!
        </div>

        {/* Admin upload button */}
        {isAdmin && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              marginTop: 12, padding: '8px 16px', borderRadius: 10,
              background: 'rgba(124,58,237,0.1)', border: '1px dashed #7c3aed',
              color: '#7c3aed', fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6,
            }}
          >
            <FiCamera /> {uploading ? 'Đang tải...' : 'Tải ảnh banner lên'}
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
    </div>
  );
}
