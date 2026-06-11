'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiStar, FiMapPin, FiArrowLeft } from 'react-icons/fi';
import { useLang } from './LangContext';

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

interface ServiceFilter {
  id: string;
  name: string;
  categoryName: string;
  price: number;
  discountPrice: number | null;
  duration: number;
}

export default function StaffList({
  initialStaff,
  serviceFilter,
}: {
  initialStaff: StaffItem[];
  serviceFilter?: ServiceFilter | null;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { t, tn } = useLang();

  // Filter staff: if serviceFilter is set, only show staff who have that service
  const staffPool = serviceFilter
    ? initialStaff.filter((s) => s.services.some((svc) => svc.id === serviceFilter.id))
    : initialStaff;

  const filtered = staffPool.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => b.rating - a.rating);

  const handleSelectStaff = (staff: StaffItem) => {
    if (!serviceFilter) return;

    // Save booking data to sessionStorage and go directly to booking page
    const bookingData = {
      staffId: staff.id,
      staffName: staff.name,
      staffAvatar: staff.avatar,
      staffRating: staff.rating,
      staffReviewCount: staff.reviewCount,
      service: {
        id: serviceFilter.id,
        name: serviceFilter.name,
        price: serviceFilter.discountPrice || serviceFilter.price,
        duration: serviceFilter.duration,
      },
    };
    sessionStorage.setItem('mobileBooking', JSON.stringify(bookingData));
    router.push('/m/dat-lich');
  };

  return (
    <>
      {/* Top Bar */}
      <div className="m-topbar">
        <button className="m-topbar-back" onClick={() => router.back()}>
          <FiArrowLeft />
        </button>
        <div className="m-search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder={t.searchService}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Service Info Banner */}
      {serviceFilter && (
        <div className="m-service-filter-banner">
          <div className="m-service-filter-label">{t.chooseYourTechnician}</div>
          <div className="m-service-filter-name">{tn(serviceFilter.name)}</div>
          <div className="m-service-filter-cat">{tn(serviceFilter.categoryName)}</div>
        </div>
      )}

      {/* Staff Cards */}
      {sorted.length > 0 ? sorted.map((staff) => (
        serviceFilter ? (
          <div
            key={staff.id}
            style={{ cursor: 'pointer' }}
            onClick={() => handleSelectStaff(staff)}
          >
            <div className="m-staff-card">
              <div className="m-staff-img-wrap">
                {staff.avatar ? (
                  <Image src={staff.avatar} alt={staff.name} className="m-staff-img" width={100} height={120} />
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
                  <span className="count">({staff.reviewCount} {t.reviews})</span>
                </div>
                <div className="m-staff-avail">
                  <FiMapPin style={{ verticalAlign: 'middle', marginRight: 2 }} /> YURI SPA BEAUTY
                </div>
                <div className="m-staff-bottom">
                  <span style={{ fontSize: '0.78rem', color: 'var(--neutral-400)' }}>
                    {staff.services.length} {t.serviceCount}
                  </span>
                  <span className="m-btn-book">{t.bookNow}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Link href={`/m/nhan-vien/${staff.id}`} key={staff.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="m-staff-card">
              <div className="m-staff-img-wrap">
                {staff.avatar ? (
                  <Image src={staff.avatar} alt={staff.name} className="m-staff-img" width={100} height={120} />
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
                  <span className="m-btn-book">{t.bookNow}</span>
                </div>
              </div>
            </div>
          </Link>
        )
      )) : (
        <div className="m-empty">
          <div className="icon">🔍</div>
          <p>{t.noResults}</p>
        </div>
      )}
    </>
  );
}
