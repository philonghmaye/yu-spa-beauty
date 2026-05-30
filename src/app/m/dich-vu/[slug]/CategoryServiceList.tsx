'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FiClock, FiSearch } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  duration: number;
  image: string | null;
}

export default function CategoryServiceList({ services, categorySlug }: { services: Service[]; categorySlug: string }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return services;
    const q = search.trim().toLowerCase();
    return services.filter(s => s.name.toLowerCase().includes(q));
  }, [services, search]);

  return (
    <div className="m-catdetail-list">
      <div className="m-catdetail-list-header">
        <h2>Danh sách dịch vụ</h2>
      </div>

      {/* Search */}
      <div style={{ padding: '0 16px 12px', position: 'relative' }}>
        <FiSearch style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)', fontSize: '0.9rem', marginTop: -6 }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm tên dịch vụ..."
          style={{
            width: '100%', padding: '10px 14px 10px 36px', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--neutral-200)', fontSize: '0.88rem',
            outline: 'none', background: '#fff',
          }}
        />
      </div>

      {filtered.map((service, index) => {
        const hasDiscount = service.discountPrice && service.discountPrice < service.price;

        return (
          <div
            key={service.id}
            className="m-catdetail-service"
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            {service.image && (
              <div className="m-catdetail-service-img-wrap">
                <img src={service.image} alt={service.name} className="m-catdetail-service-img" />
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
                  <h3 className="m-catdetail-service-name">{service.name}</h3>
                  {service.description && (
                    <p className="m-catdetail-service-desc">{service.description}</p>
                  )}
                  <div className="m-catdetail-service-meta">
                    {service.duration > 0 && (
                      <span className="m-catdetail-meta-item">
                        <FiClock style={{ fontSize: '0.72rem' }} /> {service.duration} phút
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
                  Đặt lịch
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && search.trim() && (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--neutral-400)', fontSize: '0.88rem' }}>
          Không tìm thấy dịch vụ "{search}"
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
