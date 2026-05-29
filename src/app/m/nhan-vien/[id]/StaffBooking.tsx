'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronRight } from 'react-icons/fi';

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

  const handleToggleCategory = (cat: string) => {
    setSelectedCategory(prev => prev === cat ? null : cat);
  };

  return (
    <div className="m-service-section">
      <h2>Dịch vụ của tôi</h2>

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
              <span className="m-staff-cat-chip-name">{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Services List - Show selected category */}
      {selectedCategory && grouped[selectedCategory] && (
        <div className="m-staff-services-list">
          {grouped[selectedCategory].map((service) => (
            <div key={service.id} className="m-service-item">
              <div className="m-service-item-name">{service.name}</div>
              <div className="m-duration-chips">
                <span className="m-duration-chip active">{service.duration} phút</span>
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
                <button className="m-btn-book" onClick={() => handleBook(service)}>Đặt</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show all services when no category selected */}
      {!selectedCategory && (
        <div className="m-staff-services-hint">
          <p>Chọn nhóm dịch vụ để xem chi tiết</p>
        </div>
      )}
    </div>
  );
}
