export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft, FiClock, FiTag } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils';

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = await prisma.category.findFirst({
    where: { slug, isActive: true },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!category) notFound();

  return (
    <>
      {/* Top bar */}
      <div className="m-topbar" style={{ background: 'transparent', borderBottom: 'none', position: 'absolute', zIndex: 10 }}>
        <Link href="/m/dich-vu" className="m-topbar-back" style={{ background: 'rgba(0,0,0,0.25)', color: '#fff', backdropFilter: 'blur(4px)' }}>
          <FiArrowLeft />
        </Link>
      </div>

      {/* Category Hero */}
      <div className="m-catdetail-hero">
        {category.image ? (
          <img src={category.image} alt={category.name} className="m-catdetail-hero-img" />
        ) : (
          <div className="m-catdetail-hero-gradient" />
        )}
        <div className="m-catdetail-hero-overlay" />
        <div className="m-catdetail-hero-content">
          <div className="m-catdetail-hero-icon">{category.icon || '✨'}</div>
          <h1 className="m-catdetail-hero-title">{category.name}</h1>
          {category.description && (
            <p className="m-catdetail-hero-desc">{category.description}</p>
          )}
          <div className="m-catdetail-hero-stats">
            <span className="m-catdetail-stat">
              <FiTag style={{ fontSize: '0.75rem' }} /> {category.services.length} dịch vụ
            </span>
          </div>
        </div>
      </div>

      {/* Service List */}
      <div className="m-catdetail-list">
        <div className="m-catdetail-list-header">
          <h2>Danh sách dịch vụ</h2>
        </div>

        {category.services.map((service, index) => {
          const hasDiscount = service.discountPrice && service.discountPrice < service.price;

          return (
            <div
              key={service.id}
              className="m-catdetail-service"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              {/* Service Image */}
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

              {/* Service Details */}
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
                    href="/m/dat-lich"
                    className="m-catdetail-book-btn"
                  >
                    Đặt lịch
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {category.services.length === 0 && (
          <div className="m-empty">
            <div className="icon">📋</div>
            <div>Chưa có dịch vụ nào trong nhóm này</div>
          </div>
        )}
      </div>

      {/* Bottom Spacing */}
      <div style={{ height: 24 }} />
    </>
  );
}
