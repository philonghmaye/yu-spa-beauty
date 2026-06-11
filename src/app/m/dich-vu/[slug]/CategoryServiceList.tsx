'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiSearch, FiChevronDown } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils';
import { useLang } from '../../LangContext';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  duration: number;
  image: string | null;
}

const PAGE_SIZE = 10;

export default function CategoryServiceList({ services, categorySlug }: { services: Service[]; categorySlug: string }) {
  const { t, tn } = useLang();
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (!search.trim()) return services;
    const q = search.trim().toLowerCase();
    return services.filter(s => s.name.toLowerCase().includes(q));
  }, [services, search]);

  // Reset visible count when search changes
  const displayedServices = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="m-catdetail-list">
      <div className="m-catdetail-list-header">
        <h2>{t.servicesCatalog}</h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>
          {filtered.length} {t.serviceCount}
        </span>
      </div>

      {/* Search */}
      <div style={{ padding: '0 16px 12px', position: 'relative' }}>
        <FiSearch style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)', fontSize: '0.9rem', marginTop: -6 }} />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
          placeholder={t.searchService}
          style={{
            width: '100%', padding: '10px 14px 10px 36px', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--neutral-200)', fontSize: '0.88rem',
            outline: 'none', background: '#fff',
          }}
        />
      </div>

      {displayedServices.map((service) => {
        const hasDiscount = service.discountPrice && service.discountPrice < service.price;

        return (
          <div
            key={service.id}
            className="m-catdetail-service"
          >
            {service.image && (
              <div className="m-catdetail-service-img-wrap">
                <Image src={service.image} alt={service.name} className="m-catdetail-service-img" fill sizes="(max-width: 480px) 100vw, 480px" />
                {hasDiscount && (
                  <div className="m-catdetail-discount-badge">
                    -{Math.round(((service.price - service.discountPrice!) / service.price) * 100)}%
                  </div>
                )}
              </div>
            )}

            <div className="m-catdetail-service-content">
              <div className="m-catdetail-service-top">
                <div className="m-catdetail-service-info">
                  <h3 className="m-catdetail-service-name">{tn(service.name)}</h3>
                  {service.description && (
                    <p className="m-catdetail-service-desc">{tn(service.description)}</p>
                  )}
                  <div className="m-catdetail-service-meta">
                    {service.duration > 0 && (
                      <span className="m-catdetail-meta-item">
                        <FiClock style={{ fontSize: '0.72rem' }} /> {service.duration} {t.minutes}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="m-catdetail-service-bottom">
                <div className="m-catdetail-price-wrap">
                  {hasDiscount ? (
                    <>
                      <span className="m-catdetail-price-old">
                        {formatCurrency(service.price)}
                      </span>
                      <span className="m-catdetail-price-current">
                        {formatCurrency(service.discountPrice!)}
                      </span>
                    </>
                  ) : (
                    <span className="m-catdetail-price-current">
                      {formatCurrency(service.price)}
                    </span>
                  )}
                </div>
                <Link
                  href={`/m/kham-pha?service=${service.id}`}
                  className="m-catdetail-book-btn"
                >
                  {t.bookNow}
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Load More Button */}
      {hasMore && (
        <div style={{ padding: '12px 16px 20px', textAlign: 'center' }}>
          <button
            onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 24px', borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--primary)', background: 'var(--primary-50)',
              color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Xem thêm ({filtered.length - visibleCount} còn lại) <FiChevronDown />
          </button>
        </div>
      )}

      {filtered.length === 0 && search.trim() && (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--neutral-400)', fontSize: '0.88rem' }}>
          {t.noResults}
        </div>
      )}

      {services.length === 0 && (
        <div className="m-empty">
          <div className="icon">📋</div>
          <div>Chưa có dịch vụ nào trong nhóm này</div>
        </div>
      )}
    </div>
  );
}
