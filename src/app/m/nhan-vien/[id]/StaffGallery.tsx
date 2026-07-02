'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiHeart, FiShare2 } from 'react-icons/fi';

export default function StaffGallery({ images, name }: { images: string[]; name: string }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((index: number) => {
    if (index < 0) setCurrent(images.length - 1);
    else if (index >= images.length) setCurrent(0);
    else setCurrent(index);
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // minimum swipe distance in px

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left → next image
        goTo(current + 1);
      } else {
        // Swipe right → previous image
        goTo(current - 1);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="m-staff-hero"
      style={{ position: 'relative', overflow: 'hidden', touchAction: 'pan-y' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image strip */}
      <div style={{
        display: 'flex',
        width: `${images.length * 100}%`,
        transform: `translateX(-${current * (100 / images.length)}%)`,
        transition: 'transform 0.3s ease-out',
        height: '100%',
      }}>
        {images.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`${name} ${i + 1}`}
            style={{
              width: `${100 / images.length}%`,
              height: '100%',
              objectFit: 'cover',
              flexShrink: 0,
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        ))}
      </div>

      {/* Navigation overlay */}
      <div className="m-staff-hero-overlay">
        <Link href="/m" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}>
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

      {/* Dots */}
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
          {images.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} style={{
              width: i === current ? 18 : 6, height: 6,
              borderRadius: 3, background: i === current ? '#fff' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', transition: 'all 0.3s',
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
