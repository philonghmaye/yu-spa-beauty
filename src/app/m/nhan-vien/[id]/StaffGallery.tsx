'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiHeart, FiShare2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function StaffGallery({ images, name }: { images: string[]; name: string }) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(i => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setCurrent(i => (i < images.length - 1 ? i + 1 : 0));

  return (
    <div className="m-staff-hero" style={{ position: 'relative', overflow: 'hidden' }}>
      <img src={images[current]} alt={`${name} ${current + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

      {/* Navigation overlay */}
      <div className="m-staff-hero-overlay">
        <Link href="/m/kham-pha" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}>
          <FiArrowLeft />
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <FiHeart />
          </span>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <FiShare2 />
          </span>
        </div>
      </div>

      {/* Badge */}
      <span className="m-staff-hero-badge">Chất lượng</span>

      {/* Counter */}
      {images.length > 1 && (
        <span className="m-staff-hero-count">{current + 1}/{images.length}</span>
      )}

      {/* Arrow buttons */}
      {images.length > 1 && (
        <>
          <button onClick={prev} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiChevronLeft />
          </button>
          <button onClick={next} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiChevronRight />
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
          {images.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} style={{
              width: i === current ? 16 : 6, height: 6,
              borderRadius: 3, background: i === current ? '#fff' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', transition: 'all 0.2s',
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
