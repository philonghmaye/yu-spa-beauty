'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiStar, FiMapPin, FiSliders } from 'react-icons/fi';

interface StaffItem {
  id: string;
  name: string;
  avatar: string | null;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  position: string | null;
  services: { id: string; name: string; category: string }[];
}

export default function StaffList({ initialStaff }: { initialStaff: StaffItem[] }) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const categories = Array.from(new Set(initialStaff.flatMap(s => s.services.map(sv => sv.category))));

  const filtered = initialStaff.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter !== 'all' && !s.services.some(sv => sv.category === activeFilter)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (activeFilter === 'popular') return b.reviewCount - a.reviewCount;
    return b.rating - a.rating;
  });

  return (
    <>
      {/* Top Bar */}
      <div className="m-topbar">
        <div className="m-search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder="Tìm kiếm kỹ thuật viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="m-filters">
        <button className={`m-chip ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
          <FiSliders style={{ marginRight: 4, verticalAlign: 'middle' }} /> Tất cả
        </button>
        <button className={`m-chip ${activeFilter === 'popular' ? 'active' : ''}`} onClick={() => setActiveFilter('popular')}>
          Đặt nhiều
        </button>
        {categories.map(cat => (
          <button key={cat} className={`m-chip ${activeFilter === cat ? 'active' : ''}`} onClick={() => setActiveFilter(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Staff Cards */}
      {sorted.length > 0 ? sorted.map((staff) => (
        <Link href={`/m/nhan-vien/${staff.id}`} key={staff.id} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="m-staff-card">
            <div className="m-staff-img-wrap">
              {staff.avatar ? (
                <img src={staff.avatar} alt={staff.name} className="m-staff-img" />
              ) : (
                <div className="m-staff-img" style={{ background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--primary)' }}>
                  {staff.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="m-staff-info">
              <div className="m-staff-name">{staff.name}</div>
              <div className="m-staff-rating">
                <span className="star">★</span>
                <strong>{staff.rating}</strong>
                <span className="count">({staff.reviewCount} đánh giá)</span>
              </div>
              <div className="m-staff-avail">
                <FiMapPin style={{ verticalAlign: 'middle', marginRight: 2 }} /> YURI SPA BEAUTY
              </div>
              <div className="m-staff-bottom">
                <span style={{ fontSize: '0.78rem', color: 'var(--neutral-400)' }}>
                  {staff.services.length} dịch vụ
                </span>
                <span className="m-btn-book" onClick={(e) => { e.preventDefault(); window.location.href = `/m/nhan-vien/${staff.id}`; }}>
                  Đặt
                </span>
              </div>
            </div>
          </div>
        </Link>
      )) : (
        <div className="m-empty">
          <div className="icon">🔍</div>
          <p>Không tìm thấy kỹ thuật viên</p>
        </div>
      )}
    </>
  );
}
