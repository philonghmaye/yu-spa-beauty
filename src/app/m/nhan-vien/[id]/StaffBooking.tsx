'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronRight, FiSearch } from 'react-icons/fi';
import { useLang } from '../../LangContext';

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  duration: number;
  category: string;
  categoryIcon?: string | null;
}

// Emoji mapping for known categories
const categoryEmojis: Record<string, string> = {
  'Nails': '💅',
  'Làm móng': '💅',
  'Chăm sóc da': '✨',
  'Nối mi': '👁️',
  'Massage': '💆',
  'Massage & Spa': '💆',
  'Gội đầu': '🧴',
  'Trang điểm': '💄',
  'Waxing': '🪒',
  'Làm tóc': '💇',
  'Tóc': '💇',
  'Dưỡng thể': '🧖',
  'Trị liệu': '🌿',
  'Phun xăm': '🎨',
  'Tắm trắng': '🤍',
  'Giảm béo': '🔥',
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' đ';
}

export default function StaffBooking({
  staffId, staffName, staffAvatar, staffRating, staffReviewCount, services,
}: {
  staffId: string;
  staffName: string;
  staffAvatar: string | null;
  staffRating: number;
  staffReviewCount: number;
  services: ServiceItem[];
}) {
  const router = useRouter();
  const { t, tn } = useLang();

  // Prefetch booking page + user data ngay khi render
  useEffect(() => {
    router.prefetch('/m/dat-lich');
    fetch('/api/m/me').catch(() => {});
  }, [router]);
  // Group services by category
  const grouped = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, ServiceItem[]>);

  const categories = Object.keys(grouped);

  // Default to 'Nails' if available, otherwise first category
  const defaultCat = categories.includes('Nails') ? 'Nails' : (categories[0] || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(defaultCat);

  const handleBook = (service: ServiceItem) => {
    const bookingData = {
      staffId,
      staffName,
      staffAvatar,
      staffRating,
      staffReviewCount,
      service: {
        id: service.id,
        name: service.name,
        price: service.discountPrice || service.price,
        duration: service.duration,
      },
    };
    sessionStorage.setItem('mobileBooking', JSON.stringify(bookingData));
    router.push('/m/dat-lich');
  };

  const [search, setSearch] = useState('');

  const handleToggleCategory = (cat: string) => {
    setSelectedCategory(prev => prev === cat ? null : cat);
    setSearch('');
  };

  const filteredServices = useMemo(() => {
    if (!selectedCategory || !grouped[selectedCategory]) return [];
    const list = grouped[selectedCategory];
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(s => s.name.toLowerCase().includes(q));
  }, [selectedCategory, grouped, search]);

  return (
    <div className="m-service-section">
      <h2>{t.services}</h2>

      {/* Category Filter Chips */}
      <div className="m-staff-category-chips">
        {categories.map((cat) => {
          const emoji = grouped[cat][0]?.categoryIcon || categoryEmojis[cat] || '✨';
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              className={`m-staff-cat-chip ${isActive ? 'active' : ''}`}
              onClick={() => handleToggleCategory(cat)}
            >
              <span className="m-staff-cat-chip-emoji">{emoji}</span>
              <span className="m-staff-cat-chip-name">{tn(cat)}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      {selectedCategory && (
        <div style={{ padding: '0 0 12px', position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)', fontSize: '0.9rem', marginTop: -6 }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.searchService}
            style={{
              width: '100%', padding: '10px 14px 10px 36px', borderRadius: 'var(--radius-full)',
              border: '1px solid var(--neutral-200)', fontSize: '0.88rem',
              outline: 'none', background: '#fff',
            }}
          />
        </div>
      )}

      {/* Services List - Show selected category */}
      {selectedCategory && filteredServices.length > 0 && (
        <div className="m-staff-services-list">
          {filteredServices.map((service) => (
            <div key={service.id} className="m-service-item">
              <div className="m-service-item-name">{tn(service.name)}</div>
              <div className="m-duration-chips">
                <span className="m-duration-chip active">{service.duration} {t.minutes}</span>
              </div>
              <div className="m-service-item-bottom">
                <span className="m-service-price">
                  {service.discountPrice ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: 'var(--neutral-400)', fontSize: '0.85rem', marginRight: 6 }}>
                        {formatCurrency(service.price)}
                      </span>
                      {formatCurrency(service.discountPrice)}
                    </>
                  ) : (
                    formatCurrency(service.price)
                  )}
                </span>
                <button className="m-btn-book" onClick={() => handleBook(service)}>{t.bookNow}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCategory && filteredServices.length === 0 && search.trim() && (
        <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--neutral-400)', fontSize: '0.88rem' }}>
          {t.noResults}
        </div>
      )}

      {/* Show all services when no category selected */}
      {!selectedCategory && (
        <div className="m-staff-services-hint">
          <p>{t.chooseYourTechnician}</p>
        </div>
      )}
    </div>
  );
}
