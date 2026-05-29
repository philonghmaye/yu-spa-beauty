export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import Link from 'next/link';
import { FiArrowLeft, FiChevronRight } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils';

// Default gradient colors for categories
const categoryGradients = [
  'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
];

const categoryIcons: Record<string, string> = {
  nails: '💅',
  'cham-soc-da': '✨',
  'noi-mi': '👁️',
  massage: '💆',
  'goi-dau': '🧴',
  'trang-diem': '💄',
};

export default async function ServiceCatalogPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, price: true, duration: true, image: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  const totalServices = categories.reduce((sum, c) => sum + c.services.length, 0);

  return (
    <>
      {/* Top bar */}
      <div className="m-topbar">
        <Link href="/m" className="m-topbar-back">
          <FiArrowLeft />
        </Link>
        <div className="m-topbar-title">Dịch vụ & Sản phẩm</div>
      </div>

      {/* Hero Banner */}
      <div className="m-catalog-hero">
        <div className="m-catalog-hero-content">
          <h1 className="m-catalog-hero-title">Khám phá dịch vụ</h1>
          <p className="m-catalog-hero-subtitle">
            {categories.length} nhóm dịch vụ • {totalServices} dịch vụ đa dạng
          </p>
        </div>
        <div className="m-catalog-hero-deco">
          <span>💎</span>
        </div>
      </div>

      {/* Category Grid */}
      <div className="m-catalog-grid">
        {categories.map((cat, index) => {
          const minPrice = cat.services.length > 0
            ? Math.min(...cat.services.map(s => s.price))
            : 0;
          const maxPrice = cat.services.length > 0
            ? Math.max(...cat.services.map(s => s.price))
            : 0;
          const gradient = categoryGradients[index % categoryGradients.length];
          const icon = cat.icon || categoryIcons[cat.slug] || '✨';
          const hasImage = !!cat.image;

          return (
            <Link
              key={cat.id}
              href={`/m/dich-vu/${cat.slug}`}
              className="m-catalog-card"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {/* Card Header with gradient or image */}
              <div
                className="m-catalog-card-header"
                style={{
                  background: hasImage ? 'none' : gradient,
                }}
              >
                {hasImage && (
                  <img
                    src={cat.image!}
                    alt={cat.name}
                    className="m-catalog-card-img"
                  />
                )}
                <div className="m-catalog-card-overlay" />
                <div className="m-catalog-card-icon">{icon}</div>
                <div className="m-catalog-card-count">
                  {cat.services.length} dịch vụ
                </div>
              </div>

              {/* Card Body */}
              <div className="m-catalog-card-body">
                <div className="m-catalog-card-name">{cat.name}</div>
                {cat.description && (
                  <div className="m-catalog-card-desc">{cat.description}</div>
                )}
                <div className="m-catalog-card-footer">
                  {cat.services.length > 0 ? (
                    <div className="m-catalog-card-price">
                      {minPrice === maxPrice
                        ? formatCurrency(minPrice)
                        : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
                      }
                    </div>
                  ) : (
                    <div className="m-catalog-card-price" style={{ color: 'var(--neutral-400)' }}>
                      Đang cập nhật
                    </div>
                  )}
                  <div className="m-catalog-card-arrow">
                    <FiChevronRight />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Spacing */}
      <div style={{ height: 24 }} />
    </>
  );
}
